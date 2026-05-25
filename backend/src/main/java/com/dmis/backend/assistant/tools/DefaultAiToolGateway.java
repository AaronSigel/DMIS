package com.dmis.backend.assistant.tools;

import com.dmis.backend.actions.application.ActionService;
import com.dmis.backend.actions.application.IntentParserService;
import com.dmis.backend.actions.application.dto.ActionDtos;
import com.dmis.backend.assistant.application.ContextAssemblyService;
import com.dmis.backend.assistant.application.ContextMode;
import com.dmis.backend.assistant.application.DocumentContextItem;
import com.dmis.backend.assistant.application.PreparedDocumentContext;
import com.dmis.backend.assistant.application.dto.AssistantDtos;
import com.dmis.backend.audit.application.AuditService;
import com.dmis.backend.documents.application.DocumentUseCases;
import com.dmis.backend.documents.application.dto.DocumentDtos;
import com.dmis.backend.search.application.SearchService;
import com.dmis.backend.search.application.dto.SearchDtos;
import com.dmis.backend.shared.model.UserView;
import com.dmis.backend.users.application.dto.UserSummaryView;
import com.dmis.backend.users.application.port.UserAccessPort;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
@ConditionalOnProperty(name = "assistant.tools.enabled", havingValue = "true", matchIfMissing = true)
public class DefaultAiToolGateway implements AiToolGateway {
    private final ContextAssemblyService contextAssemblyService;
    private final DocumentUseCases documentUseCases;
    private final SearchService searchService;
    private final UserAccessPort userAccessPort;
    private final IntentParserService intentParserService;
    private final ActionService actionService;
    private final AuditService auditService;

    public DefaultAiToolGateway(
            ContextAssemblyService contextAssemblyService,
            DocumentUseCases documentUseCases,
            SearchService searchService,
            UserAccessPort userAccessPort,
            IntentParserService intentParserService,
            ActionService actionService,
            AuditService auditService
    ) {
        this.contextAssemblyService = contextAssemblyService;
        this.documentUseCases = documentUseCases;
        this.searchService = searchService;
        this.userAccessPort = userAccessPort;
        this.intentParserService = intentParserService;
        this.actionService = actionService;
        this.auditService = auditService;
    }

    @Override
    public List<AiToolDefinition> listTools(UserView actor) {
        auditService.append(actor.id(), "assistant.tool.list", "assistant_tool", actor.id(), "tools=5");
        return List.of(
                definition(
                        AiToolName.DOCUMENTS_GET_STATUS,
                        "Статус документов",
                        "Возвращает статус индексации и метаданные выбранных документов.",
                        Map.of(
                                "type", "object",
                                "required", List.of("documentIds"),
                                "properties", Map.of("documentIds", Map.of("type", "array", "items", Map.of("type", "string")))
                        ),
                        true,
                        false
                ),
                definition(
                        AiToolName.DOCUMENTS_GET_CONTEXT,
                        "Контекст документов",
                        "Детерминированно собирает контекст для AI-запроса по документам.",
                        Map.of(
                                "type", "object",
                                "required", List.of("documentIds"),
                                "properties", Map.of(
                                        "documentIds", Map.of("type", "array", "items", Map.of("type", "string")),
                                        "question", Map.of("type", "string"),
                                        "mode", Map.of("type", "string")
                                )
                        ),
                        true,
                        false
                ),
                definition(
                        AiToolName.DOCUMENTS_SEARCH,
                        "Поиск документов",
                        "Ищет документы и релевантные фрагменты по запросу.",
                        Map.of(
                                "type", "object",
                                "required", List.of("query"),
                                "properties", Map.of(
                                        "query", Map.of("type", "string"),
                                        "limit", Map.of("type", "integer")
                                )
                        ),
                        true,
                        false
                ),
                definition(
                        AiToolName.USERS_RESOLVE,
                        "Поиск пользователя",
                        "Находит пользователя по email, имени или nickname.",
                        Map.of(
                                "type", "object",
                                "required", List.of("query"),
                                "properties", Map.of("query", Map.of("type", "string"))
                        ),
                        true,
                        false
                ),
                definition(
                        AiToolName.ACTIONS_PREPARE_DRAFT,
                        "Подготовить draft действия",
                        "Создаёт draft AI-действия без выполнения.",
                        Map.of(
                                "type", "object",
                                "required", List.of("userText"),
                                "properties", Map.of(
                                        "userText", Map.of("type", "string"),
                                        "documentIds", Map.of("type", "array", "items", Map.of("type", "string"))
                                )
                        ),
                        false,
                        true
                )
        );
    }

    @Override
    public AiToolCallResult call(UserView actor, AiToolCallRequest request) {
        AiToolName toolName = AiToolName.from(request.name());
        if (toolName == null) {
            auditService.append(actor.id(), "assistant.tool.call.failed", "assistant_tool", safeTrace(request), "unknownTool=" + request.name());
            return failure(request.name(), "UNKNOWN_TOOL", "Неизвестный инструмент: " + request.name());
        }
        Map<String, Object> args = request.arguments() == null ? Map.of() : request.arguments();
        try {
            AiToolCallResult result = switch (toolName) {
                case DOCUMENTS_GET_STATUS -> documentsGetStatus(actor, args);
                case DOCUMENTS_GET_CONTEXT -> documentsGetContext(actor, args);
                case DOCUMENTS_SEARCH -> documentsSearch(actor, args);
                case USERS_RESOLVE -> usersResolve(actor, args);
                case ACTIONS_PREPARE_DRAFT -> actionsPrepareDraft(actor, args);
            };
            auditService.append(actor.id(), "assistant.tool.call", "assistant_tool", safeTrace(request), "tool=" + toolName.toolName() + ", success=" + result.success());
            return result;
        } catch (IllegalArgumentException exception) {
            auditService.append(actor.id(), "assistant.tool.call.failed", "assistant_tool", safeTrace(request), "tool=" + toolName.toolName() + ", error=" + exception.getMessage());
            return failure(toolName.toolName(), "INVALID_ARGUMENTS", exception.getMessage());
        } catch (Exception exception) {
            auditService.append(actor.id(), "assistant.tool.call.failed", "assistant_tool", safeTrace(request), "tool=" + toolName.toolName() + ", error=" + exception.getMessage());
            return failure(toolName.toolName(), "ERROR", "Не удалось выполнить инструмент.");
        }
    }

    private AiToolCallResult documentsGetStatus(UserView actor, Map<String, Object> args) {
        List<String> documentIds = readStringList(args.get("documentIds"));
        if (documentIds.isEmpty()) {
            throw new IllegalArgumentException("documentIds обязателен.");
        }
        List<AssistantDtos.AssistantDocumentStatusView> documents = contextAssemblyService.documentStatuses(actor, documentIds);
        Map<String, Object> content = new LinkedHashMap<>();
        content.put("documents", documents.stream().map(this::statusMap).toList());
        return success(AiToolName.DOCUMENTS_GET_STATUS.toolName(), "OK", content);
    }

    private AiToolCallResult documentsGetContext(UserView actor, Map<String, Object> args) {
        List<String> documentIds = readStringList(args.get("documentIds"));
        if (documentIds.isEmpty()) {
            throw new IllegalArgumentException("documentIds обязателен.");
        }
        String question = readString(args.get("question"), "");
        ContextMode mode = parseContextMode(readString(args.get("mode"), "AUTO"));
        PreparedDocumentContext context = contextAssemblyService.prepareDocumentContext(actor, question, documentIds, mode);
        Map<String, Object> content = new LinkedHashMap<>();
        content.put("status", context.status());
        content.put("diagnosticCode", context.diagnosticCode());
        content.put("userMessage", context.userMessage());
        content.put("llmAllowed", context.llmAllowed());
        content.put("documentIds", context.documentIds());
        content.put("documents", context.documents().stream().map(this::statusMap).toList());
        content.put("contextChunksCount", context.contextChunks().size());
        content.put("sourcesCount", context.sources().size());
        return success(AiToolName.DOCUMENTS_GET_CONTEXT.toolName(), context.status(), content);
    }

    private AiToolCallResult documentsSearch(UserView actor, Map<String, Object> args) {
        String query = readString(args.get("query"), null);
        if (query == null || query.isBlank()) {
            throw new IllegalArgumentException("query обязателен.");
        }
        int limit = readInt(args.get("limit"), 10);
        DocumentDtos.PageResponse<DocumentDtos.DocumentView> documents = documentUseCases.list(
                actor,
                new DocumentDtos.DocumentListQuery(null, null, null, null, "updatedAt", "desc", null, null, 0, Math.min(limit, 20))
        );
        SearchDtos.SearchOnlyResponse search = searchService.search(actor, query);
        Map<String, Object> content = new LinkedHashMap<>();
        content.put("documents", documents.content().stream().limit(limit).map(doc -> Map.of(
                "documentId", doc.id(),
                "title", doc.title(),
                "status", doc.status()
        )).toList());
        content.put("hits", search.hits().stream().limit(limit).map(hit -> Map.of(
                "documentId", hit.documentId(),
                "documentTitle", hit.documentTitle(),
                "chunkId", hit.chunkId(),
                "score", hit.score()
        )).toList());
        return success(AiToolName.DOCUMENTS_SEARCH.toolName(), search.status(), content);
    }

    private AiToolCallResult usersResolve(UserView actor, Map<String, Object> args) {
        String query = readString(args.get("query"), null);
        if (query == null || query.isBlank()) {
            throw new IllegalArgumentException("query обязателен.");
        }
        String normalized = query.trim().toLowerCase(Locale.ROOT);
        List<UserSummaryView> matches = userAccessPort.findAllSummaries().stream()
                .filter(user -> matchesUser(user, normalized))
                .limit(10)
                .toList();
        Map<String, Object> content = new LinkedHashMap<>();
        content.put("users", matches.stream().map(user -> Map.of(
                "id", user.id(),
                "email", user.email(),
                "fullName", user.fullName(),
                "nickname", user.nickname() == null ? "" : user.nickname()
        )).toList());
        return success(AiToolName.USERS_RESOLVE.toolName(), "OK", content);
    }

    private AiToolCallResult actionsPrepareDraft(UserView actor, Map<String, Object> args) {
        String userText = readString(args.get("userText"), null);
        if (userText == null || userText.isBlank()) {
            throw new IllegalArgumentException("userText обязателен.");
        }
        List<String> documentIds = readStringList(args.get("documentIds"));
        IntentParserService.ParsedDraft parsedDraft = intentParserService.parseDraft(userText, documentIds);
        ActionDtos.AiActionView draft = actionService.draft(actor, parsedDraft.intent(), parsedDraft.entities());
        Map<String, Object> content = new LinkedHashMap<>();
        content.put("draftId", draft.id());
        content.put("intent", draft.intent());
        content.put("status", draft.status().name());
        content.put("requiresConfirmation", true);
        return success(AiToolName.ACTIONS_PREPARE_DRAFT.toolName(), "DRAFT", content);
    }

    private boolean matchesUser(UserSummaryView user, String normalizedQuery) {
        return contains(user.email(), normalizedQuery)
                || contains(user.fullName(), normalizedQuery)
                || contains(user.nickname(), normalizedQuery);
    }

    private boolean contains(String value, String query) {
        return value != null && value.toLowerCase(Locale.ROOT).contains(query);
    }

    private Map<String, Object> statusMap(AssistantDtos.AssistantDocumentStatusView view) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("documentId", view.documentId());
        map.put("title", view.title());
        map.put("status", view.status());
        map.put("indexedChunkCount", view.indexedChunkCount());
        map.put("extractedTextLength", view.extractedTextLength());
        map.put("indexedAt", view.indexedAt());
        return map;
    }

    private Map<String, Object> statusMap(DocumentContextItem item) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("documentId", item.documentId());
        map.put("title", item.title());
        map.put("status", item.indexStatus());
        map.put("indexedChunkCount", item.indexedChunkCount());
        map.put("extractedTextLength", item.extractedTextLength());
        map.put("indexedAt", item.indexedAt());
        map.put("diagnosticCode", item.diagnosticCode());
        return map;
    }

    private AiToolDefinition definition(
            AiToolName name,
            String title,
            String description,
            Map<String, Object> inputSchema,
            boolean readOnly,
            boolean requiresConfirmation
    ) {
        return new AiToolDefinition(name.toolName(), title, description, inputSchema, readOnly, requiresConfirmation);
    }

    private static AiToolCallResult success(String name, String status, Map<String, Object> structuredContent) {
        return new AiToolCallResult(name, true, status, null, structuredContent);
    }

    private static AiToolCallResult failure(String name, String status, String message) {
        return new AiToolCallResult(name, false, status, message, Map.of());
    }

    private static String safeTrace(AiToolCallRequest request) {
        return request.traceId() == null || request.traceId().isBlank() ? "trace-unknown" : request.traceId();
    }

    private static String readString(Object value, String fallback) {
        if (value == null) {
            return fallback;
        }
        return String.valueOf(value);
    }

    private static int readInt(Object value, int fallback) {
        if (value instanceof Number number) {
            return number.intValue();
        }
        if (value instanceof String text && !text.isBlank()) {
            return Integer.parseInt(text.trim());
        }
        return fallback;
    }

    private static List<String> readStringList(Object value) {
        if (value == null) {
            return List.of();
        }
        if (value instanceof List<?> list) {
            List<String> result = new ArrayList<>();
            for (Object item : list) {
                if (item != null && !String.valueOf(item).isBlank()) {
                    result.add(String.valueOf(item).trim());
                }
            }
            return result;
        }
        if (value instanceof String text && !text.isBlank()) {
            return List.of(text.trim());
        }
        return List.of();
    }

    private static ContextMode parseContextMode(String value) {
        try {
            return ContextMode.valueOf(value.trim().toUpperCase(Locale.ROOT));
        } catch (Exception ignored) {
            return ContextMode.AUTO;
        }
    }
}
