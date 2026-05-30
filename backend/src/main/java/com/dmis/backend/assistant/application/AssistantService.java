package com.dmis.backend.assistant.application;

import com.dmis.backend.actions.application.ActionDraftBuildResult;
import com.dmis.backend.actions.application.ActionDraftBuilder;
import com.dmis.backend.actions.application.ActionService;
import com.dmis.backend.actions.application.IntentParserService;
import com.dmis.backend.actions.application.dto.ActionDtos;
import com.dmis.backend.assistant.application.dto.AssistantDtos;
import com.dmis.backend.assistant.application.port.AssistantPort;
import com.dmis.backend.assistant.application.port.ThreadTitleGeneratorPort;
import com.dmis.backend.assistant.tools.AiToolCallRequest;
import com.dmis.backend.assistant.tools.AiToolCallResult;
import com.dmis.backend.assistant.tools.AiToolDefinition;
import com.dmis.backend.assistant.tools.AiToolGateway;
import com.dmis.backend.audit.application.AuditService;
import com.dmis.backend.documents.application.DocumentUseCases;
import com.dmis.backend.documents.application.dto.DocumentDtos;
import com.dmis.backend.search.application.SearchService;
import com.dmis.backend.shared.model.UserView;
import com.dmis.backend.shared.security.AclService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class AssistantService {
    private static final List<String> DEFAULT_KNOWLEDGE_SOURCES = List.of("documents");
    private static final String DEFAULT_IDEOLOGY_PROFILE = "balanced";

    private final AssistantPort assistantPort;
    private final DocumentUseCases documentUseCases;
    private final SearchService searchService;
    private final AclService aclService;
    private final AuditService auditService;
    private final ThreadTitleGeneratorPort threadTitleGeneratorPort;
    private final IntentParserService intentParserService;
    private final ActionService actionService;
    private final ContextAssemblyService contextAssemblyService;
    private final AssistantRagOrchestrator assistantRagOrchestrator;
    private final AssistantRequestRouter assistantRequestRouter;
    private final ActionDraftBuilder actionDraftBuilder;
    private final AiToolGateway aiToolGateway;

    public AssistantService(
            AssistantPort assistantPort,
            DocumentUseCases documentUseCases,
            SearchService searchService,
            AclService aclService,
            AuditService auditService,
            ThreadTitleGeneratorPort threadTitleGeneratorPort,
            IntentParserService intentParserService,
            ActionService actionService,
            ContextAssemblyService contextAssemblyService,
            AssistantRagOrchestrator assistantRagOrchestrator,
            AssistantRequestRouter assistantRequestRouter,
            ActionDraftBuilder actionDraftBuilder,
            @Autowired(required = false) AiToolGateway aiToolGateway
    ) {
        this.assistantPort = assistantPort;
        this.documentUseCases = documentUseCases;
        this.searchService = searchService;
        this.aclService = aclService;
        this.auditService = auditService;
        this.threadTitleGeneratorPort = threadTitleGeneratorPort;
        this.intentParserService = intentParserService;
        this.actionService = actionService;
        this.contextAssemblyService = contextAssemblyService;
        this.assistantRagOrchestrator = assistantRagOrchestrator;
        this.assistantRequestRouter = assistantRequestRouter;
        this.actionDraftBuilder = actionDraftBuilder;
        this.aiToolGateway = aiToolGateway;
    }

    public AssistantDtos.ThreadView createThread(UserView actor, String title) {
        Instant now = Instant.now();
        AssistantDtos.AssistantPreferencesView preferences = preferences(actor);
        AssistantDtos.ThreadView created = assistantPort.saveThread(new AssistantDtos.ThreadView(
                "thread-" + UUID.randomUUID(),
                actor.id(),
                title == null || title.isBlank() ? "Новый диалог" : title.trim(),
                preferences.ideologyProfileId(),
                preferences.knowledgeSourceIds(),
                now,
                now
        ));
        auditService.append(actor.id(), "assistant.thread.create", "assistant_thread", created.id(), "Thread created");
        return created;
    }

    public List<AssistantDtos.ThreadView> listThreads(UserView actor) {
        return assistantPort.findThreadsByOwner(actor.id()).stream()
                .sorted(Comparator.comparing(AssistantDtos.ThreadView::updatedAt).reversed())
                .toList();
    }

    public AssistantDtos.ThreadDetailView getThread(UserView actor, String threadId) {
        AssistantDtos.ThreadView thread = loadAccessibleThread(actor, threadId);
        return new AssistantDtos.ThreadDetailView(
                thread,
                assistantPort.findMessagesByThreadId(thread.id()),
                assistantPort.findLinkedDocumentIds(thread.id())
        );
    }

    public AssistantDtos.ThreadView generateThreadTitle(UserView actor, String threadId) {
        AssistantDtos.ThreadView thread = loadAccessibleThread(actor, threadId);
        List<AssistantDtos.MessageView> messages = assistantPort.findMessagesByThreadId(thread.id());
        String currentTitle = thread.title() == null || thread.title().isBlank() ? "Новый диалог" : thread.title();

        String generated = threadTitleGeneratorPort.generateTitle(
                extractFirstUserMessage(messages),
                extractFirstAssistantMessage(messages),
                currentTitle
        );
        String safeTitle = normalizeGeneratedTitle(generated, currentTitle);
        Instant now = Instant.now();
        AssistantDtos.ThreadView updated = assistantPort.saveThread(new AssistantDtos.ThreadView(
                thread.id(),
                thread.ownerId(),
                safeTitle,
                thread.ideologyProfileId(),
                thread.knowledgeSourceIds(),
                thread.createdAt(),
                now
        ));
        auditService.append(actor.id(), "assistant.thread.title.generate", "assistant_thread", thread.id(), "Thread title generated");
        return updated;
    }

    public void deleteThread(UserView actor, String threadId) {
        AssistantDtos.ThreadView thread = loadAccessibleThread(actor, threadId);
        assistantPort.deleteThread(thread.id());
        auditService.append(actor.id(), "assistant.thread.delete", "assistant_thread", thread.id(), "Thread deleted");
    }

    public AssistantDtos.SendMessageResult sendMessage(
            UserView actor,
            String threadId,
            String question,
            List<String> selectedDocumentIds,
            List<String> knowledgeSourceIds,
            String ideologyProfileId
    ) {
        AssistantDtos.ThreadView thread = loadAccessibleThread(actor, threadId);
        List<String> effectiveSelected = assistantRagOrchestrator.resolveEffectiveDocumentIds(actor, thread.id(), selectedDocumentIds);
        validateDocumentAccess(actor, effectiveSelected);

        Instant now = Instant.now();
        AssistantDtos.MessageView userMessage = assistantPort.saveMessage(new AssistantDtos.MessageView(
                "msg-" + UUID.randomUUID(),
                thread.id(),
                "USER",
                question,
                effectiveSelected,
                now
        ));
        SearchService.AnswerOptions options = new SearchService.AnswerOptions(
                effectiveSelected,
                normalizeKnowledgeSources(knowledgeSourceIds, thread.knowledgeSourceIds()),
                normalizeIdeologyProfile(ideologyProfileId, thread.ideologyProfileId())
        );
        AssistantRagOrchestrator.RagOrchestrationResult orchestration = assistantRagOrchestrator.orchestrate(
                actor,
                thread.id(),
                question,
                selectedDocumentIds,
                options.knowledgeSourceIds(),
                options.ideologyProfileId(),
                "rag.answer"
        );
        var rag = orchestration.response();
        AssistantDtos.MessageView assistantMessage = assistantPort.saveMessage(new AssistantDtos.MessageView(
                "msg-" + UUID.randomUUID(),
                thread.id(),
                "ASSISTANT",
                rag.answer(),
                effectiveSelected,
                Instant.now()
        ));
        assistantPort.saveThread(new AssistantDtos.ThreadView(
                thread.id(),
                thread.ownerId(),
                thread.title(),
                options.ideologyProfileId(),
                options.knowledgeSourceIds(),
                thread.createdAt(),
                Instant.now()
        ));
        auditService.append(actor.id(), "assistant.message.send", "assistant_thread", thread.id(), "Message sent");
        return new AssistantDtos.SendMessageResult(
                userMessage,
                assistantMessage,
                rag,
                orchestration.contextStatus(),
                orchestration.contextDiagnosticCode(),
                orchestration.contextDocuments()
        );
    }

    public List<AssistantDtos.AssistantDocumentStatusView> documentStatuses(UserView actor, List<String> documentIds) {
        return contextAssemblyService.documentStatuses(actor, documentIds);
    }

    public List<AssistantDtos.AiToolDefinitionView> listTools(UserView actor) {
        if (aiToolGateway == null) {
            return List.of();
        }
        return aiToolGateway.listTools(actor).stream().map(this::toToolDefinitionView).toList();
    }

    public AssistantDtos.AiToolCallResultView callTool(UserView actor, String name, Map<String, Object> arguments, String traceId) {
        if (aiToolGateway == null) {
            throw new ResponseStatusException(NOT_FOUND, "Assistant tools are disabled");
        }
        return toToolCallResultView(aiToolGateway.call(actor, new AiToolCallRequest(name, arguments, traceId)));
    }

    private AssistantDtos.AiToolDefinitionView toToolDefinitionView(AiToolDefinition definition) {
        return new AssistantDtos.AiToolDefinitionView(
                definition.name(),
                definition.title(),
                definition.description(),
                definition.inputSchema(),
                definition.readOnly(),
                definition.requiresConfirmation()
        );
    }

    private AssistantDtos.AiToolCallResultView toToolCallResultView(AiToolCallResult result) {
        return new AssistantDtos.AiToolCallResultView(
                result.name(),
                result.success(),
                result.status(),
                result.message(),
                result.structuredContent()
        );
    }

    public ActionDtos.AiActionView parseActionDraft(UserView actor, String userText) {
        return parseActionDraft(actor, userText, List.of());
    }

    public ActionDtos.AiActionView parseActionDraft(UserView actor, String userText, List<String> selectedDocumentIds) {
        IntentParserService.ParsedDraft parsedDraft = intentParserService.parseDraft(userText, selectedDocumentIds);
        return actionService.draft(actor, parsedDraft.intent(), parsedDraft.entities());
    }

    public AssistantDtos.SubmitRequestResult submitRequest(
            UserView actor,
            String threadId,
            String text,
            List<String> selectedDocumentIds,
            List<String> knowledgeSourceIds,
            String ideologyProfileId,
            boolean stream
    ) {
        AssistantDtos.ThreadView thread = loadAccessibleThread(actor, threadId);
        List<String> linkedDocumentIds = assistantPort.findLinkedDocumentIds(thread.id());
        String traceId = "trace-" + UUID.randomUUID();
        List<String> normalizedSelected = selectedDocumentIds == null ? List.of() : selectedDocumentIds;

        auditService.append(
                actor.id(),
                "assistant.request.received",
                "assistant_thread",
                thread.id(),
                "traceId=" + traceId
                        + ", selectedDocumentIds=" + normalizedSelected
                        + ", linkedDocumentIds=" + linkedDocumentIds
        );

        AssistantRequestRouter.RoutingDecision routing = assistantRequestRouter.route(
                text,
                normalizedSelected,
                linkedDocumentIds
        );

        auditService.append(
                actor.id(),
                "assistant.request.routed",
                "assistant_thread",
                thread.id(),
                "traceId=" + traceId + ", requestType=" + routing.requestType()
        );

        if (routing.isDiagnosticOnly()) {
            return new AssistantDtos.SubmitRequestResult(
                    routing.requestType().name(),
                    traceId,
                    null,
                    null,
                    null,
                    "NO_CONTEXT",
                    routing.diagnosticCode(),
                    routing.diagnosticMessage(),
                    List.of()
            );
        }

        if (routing.requestType() == RequestType.CONTROLLED_ACTION) {
            ControlledActionOutcome outcome = resolveControlledActionDraft(
                    actor,
                    text,
                    normalizedSelected,
                    linkedDocumentIds,
                    traceId
            );
            if (outcome.clarification() != null) {
                ActionDraftBuildResult clarification = outcome.clarification();
                auditService.append(
                        actor.id(),
                        "assistant.action.clarification",
                        "assistant_thread",
                        thread.id(),
                        "traceId=" + traceId
                                + ", intent=" + clarification.intent()
                                + ", missing=" + clarification.missingFields()
                );
                return new AssistantDtos.SubmitRequestResult(
                        RequestType.CONTROLLED_ACTION.name(),
                        traceId,
                        null,
                        null,
                        null,
                        "NEEDS_CLARIFICATION",
                        null,
                        "Нужно уточнить данные для действия.",
                        List.of(),
                        AssistantDtos.RESPONSE_NEEDS_CLARIFICATION,
                        clarification.intent(),
                        clarification.missingFields(),
                        clarification.partialEntities()
                );
            }
            return new AssistantDtos.SubmitRequestResult(
                    RequestType.CONTROLLED_ACTION.name(),
                    traceId,
                    outcome.action(),
                    null,
                    null,
                    "OK",
                    null,
                    null,
                    List.of(),
                    AssistantDtos.RESPONSE_ACTION_DRAFT,
                    null,
                    List.of(),
                    Map.of()
            );
        }

        List<String> effectiveDocumentIds = assistantRagOrchestrator.resolveEffectiveDocumentIds(
                actor,
                thread.id(),
                normalizedSelected
        );
        validateDocumentAccess(actor, effectiveDocumentIds);

        List<String> normalizedKnowledgeSources = normalizeKnowledgeSources(knowledgeSourceIds, thread.knowledgeSourceIds());
        String normalizedProfile = normalizeIdeologyProfile(ideologyProfileId, thread.ideologyProfileId());

        if (!stream) {
            AssistantDtos.SendMessageResult messageResult = sendMessage(
                    actor,
                    thread.id(),
                    text,
                    normalizedSelected,
                    normalizedKnowledgeSources,
                    normalizedProfile
            );
            return new AssistantDtos.SubmitRequestResult(
                    routing.requestType().name(),
                    traceId,
                    null,
                    null,
                    null,
                    messageResult.rag().status(),
                    messageResult.contextDiagnosticCode(),
                    messageResult.rag().answer(),
                    messageResult.contextDocuments()
            );
        }

        AssistantDtos.SubmitStreamPayload streamPayload = new AssistantDtos.SubmitStreamPayload(
                text,
                thread.id(),
                normalizedSelected,
                normalizedKnowledgeSources,
                normalizedProfile
        );
        return new AssistantDtos.SubmitRequestResult(
                routing.requestType().name(),
                traceId,
                null,
                "/api/rag/answer-with-sources/stream",
                streamPayload,
                "OK",
                null,
                null,
                contextAssemblyService.documentStatuses(actor, effectiveDocumentIds)
        );
    }

    private ControlledActionOutcome resolveControlledActionDraft(
            UserView actor,
            String text,
            List<String> selectedDocumentIds,
            List<String> linkedDocumentIds,
            String traceId
    ) {
        if (actionDraftBuilder.supportsSendEmail(text)) {
            ActionDraftBuildResult built = actionDraftBuilder.tryBuildSendEmail(
                    text,
                    selectedDocumentIds,
                    linkedDocumentIds
            );
            if (built.needsClarification()) {
                return ControlledActionOutcome.clarification(built);
            }
            ActionDtos.AiActionView action = actionService.draft(
                    actor,
                    ActionDtos.SEND_EMAIL_INTENT,
                    (ActionDtos.SendEmailEntities) built.entities()
            );
            auditService.append(
                    actor.id(),
                    "assistant.action.draft.created",
                    "ai_action",
                    action.id(),
                    "traceId=" + traceId + ", intent=send_email, source=builder"
            );
            return ControlledActionOutcome.draft(action);
        }
        if (actionDraftBuilder.supportsCreateCalendarEvent(text)) {
            ActionDraftBuildResult built = actionDraftBuilder.tryBuildCreateCalendarEvent(text, actor.email());
            if (built.needsClarification()) {
                return ControlledActionOutcome.clarification(built);
            }
            ActionDtos.AiActionView action = actionService.draft(
                    actor,
                    ActionDtos.CREATE_CALENDAR_EVENT_INTENT,
                    (ActionDtos.CreateCalendarEventEntities) built.entities()
            );
            auditService.append(
                    actor.id(),
                    "assistant.action.draft.created",
                    "ai_action",
                    action.id(),
                    "traceId=" + traceId + ", intent=create_calendar_event, source=builder"
            );
            return ControlledActionOutcome.draft(action);
        }
        try {
            ActionDtos.AiActionView action = parseActionDraft(actor, text, selectedDocumentIds);
            auditService.append(
                    actor.id(),
                    "assistant.action.draft.created",
                    "ai_action",
                    action.id(),
                    "traceId=" + traceId + ", intent=" + action.intent() + ", source=parser"
            );
            return ControlledActionOutcome.draft(action);
        } catch (ResponseStatusException parserError) {
            auditService.append(
                    actor.id(),
                    "assistant.action.failed",
                    "assistant_thread",
                    actor.id(),
                    "traceId=" + traceId + ", parser=" + parserError.getReason()
            );
            throw parserError;
        }
    }

    private record ControlledActionOutcome(
            ActionDtos.AiActionView action,
            ActionDraftBuildResult clarification
    ) {
        static ControlledActionOutcome draft(ActionDtos.AiActionView action) {
            return new ControlledActionOutcome(action, null);
        }

        static ControlledActionOutcome clarification(ActionDraftBuildResult clarification) {
            return new ControlledActionOutcome(null, clarification);
        }
    }

    public void appendStreamMessages(
            UserView actor,
            String threadId,
            String question,
            String answer,
            List<String> selectedDocumentIds,
            List<String> knowledgeSourceIds,
            String ideologyProfileId
    ) {
        if (threadId == null || threadId.isBlank()) {
            return;
        }
        AssistantDtos.ThreadView thread = loadAccessibleThread(actor, threadId);
        List<String> effectiveSelected = assistantRagOrchestrator.resolveEffectiveDocumentIds(actor, thread.id(), selectedDocumentIds);
        validateDocumentAccess(actor, effectiveSelected);
        SearchService.AnswerOptions options = new SearchService.AnswerOptions(
                effectiveSelected,
                normalizeKnowledgeSources(knowledgeSourceIds, thread.knowledgeSourceIds()),
                normalizeIdeologyProfile(ideologyProfileId, thread.ideologyProfileId())
        );
        Instant now = Instant.now();
        assistantPort.saveMessage(new AssistantDtos.MessageView(
                "msg-" + UUID.randomUUID(),
                thread.id(),
                "USER",
                question,
                effectiveSelected,
                now
        ));
        assistantPort.saveMessage(new AssistantDtos.MessageView(
                "msg-" + UUID.randomUUID(),
                thread.id(),
                "ASSISTANT",
                answer,
                effectiveSelected,
                Instant.now()
        ));
        assistantPort.saveThread(new AssistantDtos.ThreadView(
                thread.id(),
                thread.ownerId(),
                thread.title(),
                options.ideologyProfileId(),
                options.knowledgeSourceIds(),
                thread.createdAt(),
                Instant.now()
        ));
        auditService.append(actor.id(), "assistant.message.stream.save", "assistant_thread", thread.id(), "Stream message pair saved");
    }

    public void linkDocument(UserView actor, String threadId, String documentId) {
        AssistantDtos.ThreadView thread = loadAccessibleThread(actor, threadId);
        DocumentDtos.DocumentView document = documentUseCases.get(actor, documentId);
        aclService.requireDocumentRead(actor, document.id(), document.ownerId());
        assistantPort.linkDocument(thread.id(), documentId);
        auditService.append(actor.id(), "assistant.thread.link_document", "assistant_thread", thread.id(), "Linked " + documentId);
    }

    public void unlinkDocument(UserView actor, String threadId, String documentId) {
        AssistantDtos.ThreadView thread = loadAccessibleThread(actor, threadId);
        assistantPort.unlinkDocument(thread.id(), documentId);
        auditService.append(actor.id(), "assistant.thread.unlink_document", "assistant_thread", thread.id(), "Unlinked " + documentId);
    }

    public AssistantDtos.MentionDocumentView uploadAndLink(UserView actor, String threadId, String fileName, byte[] bytes, String contentType) {
        AssistantDtos.ThreadView thread = loadAccessibleThread(actor, threadId);
        DocumentDtos.DocumentView uploaded = documentUseCases.upload(actor, fileName, bytes, contentType);
        assistantPort.linkDocument(thread.id(), uploaded.id());
        return new AssistantDtos.MentionDocumentView(uploaded.id(), uploaded.title(), uploaded.updatedAt());
    }

    public List<AssistantDtos.MentionDocumentView> mentionCandidates(UserView actor, String query, int limit) {
        String normalized = query == null ? "" : query.trim().toLowerCase();
        int safeLimit = Math.min(Math.max(limit, 1), 20);
        return documentUseCases.list(actor, new DocumentDtos.DocumentListQuery(null, null, null, null, "updatedAt", "desc", null, null, 0, 200))
                .content().stream()
                .filter(doc -> normalized.isBlank() || doc.title().toLowerCase().contains(normalized) || doc.id().toLowerCase().contains(normalized))
                .limit(safeLimit)
                .map(doc -> new AssistantDtos.MentionDocumentView(doc.id(), doc.title(), doc.updatedAt()))
                .toList();
    }

    public AssistantDtos.AssistantPreferencesView preferences(UserView actor) {
        return assistantPort.findPreferencesByOwner(actor.id())
                .orElseGet(() -> new AssistantDtos.AssistantPreferencesView(
                        actor.id(),
                        DEFAULT_IDEOLOGY_PROFILE,
                        DEFAULT_KNOWLEDGE_SOURCES,
                        Instant.now()
                ));
    }

    public AssistantDtos.AssistantPreferencesView savePreferences(UserView actor, String ideologyProfileId, List<String> knowledgeSourceIds) {
        AssistantDtos.AssistantPreferencesView saved = assistantPort.savePreferences(new AssistantDtos.AssistantPreferencesView(
                actor.id(),
                normalizeIdeologyProfile(ideologyProfileId, DEFAULT_IDEOLOGY_PROFILE),
                normalizeKnowledgeSources(knowledgeSourceIds, DEFAULT_KNOWLEDGE_SOURCES),
                Instant.now()
        ));
        auditService.append(actor.id(), "assistant.preferences.update", "assistant_preferences", actor.id(), "Preferences updated");
        return saved;
    }

    private AssistantDtos.ThreadView loadAccessibleThread(UserView actor, String threadId) {
        AssistantDtos.ThreadView thread = assistantPort.findThreadById(threadId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Thread not found"));
        if (!thread.ownerId().equals(actor.id()) && !aclService.isAdmin(actor)) {
            throw new ResponseStatusException(NOT_FOUND, "Thread not found");
        }
        return thread;
    }

    /**
     * Проверяет ACL thread перед RAG/stream-вызовами с {@code threadId}.
     */
    public void requireAccessibleThread(UserView actor, String threadId) {
        if (threadId == null || threadId.isBlank()) {
            return;
        }
        loadAccessibleThread(actor, threadId);
    }

    private void validateDocumentAccess(UserView actor, List<String> documentIds) {
        for (String documentId : documentIds) {
            DocumentDtos.DocumentView document = documentUseCases.get(actor, documentId);
            aclService.requireDocumentRead(actor, document.id(), document.ownerId());
        }
    }

    private List<String> normalizeKnowledgeSources(List<String> requested, List<String> fallback) {
        List<String> source = (requested == null || requested.isEmpty()) ? fallback : requested;
        if (source == null || source.isEmpty()) {
            return DEFAULT_KNOWLEDGE_SOURCES;
        }
        return source.stream().map(String::trim).filter(s -> !s.isBlank()).distinct().toList();
    }

    private String normalizeIdeologyProfile(String requested, String fallback) {
        String value = requested == null || requested.isBlank() ? fallback : requested;
        if (value == null || value.isBlank()) {
            return DEFAULT_IDEOLOGY_PROFILE;
        }
        return value.trim();
    }

    private static String extractFirstUserMessage(List<AssistantDtos.MessageView> messages) {
        return messages.stream()
                .filter(message -> "USER".equalsIgnoreCase(message.role()))
                .map(AssistantDtos.MessageView::content)
                .filter(content -> content != null && !content.isBlank())
                .findFirst()
                .orElse("");
    }

    private static String extractFirstAssistantMessage(List<AssistantDtos.MessageView> messages) {
        return messages.stream()
                .filter(message -> "ASSISTANT".equalsIgnoreCase(message.role()))
                .map(AssistantDtos.MessageView::content)
                .filter(content -> content != null && !content.isBlank())
                .findFirst()
                .orElse("");
    }

    private static String normalizeGeneratedTitle(String generated, String fallback) {
        String value = generated == null || generated.isBlank() ? fallback : generated.trim();
        if (value.length() > 120) {
            return value.substring(0, 120).trim();
        }
        return value;
    }
}
