package com.dmis.backend.assistant.application;

import com.dmis.backend.assistant.application.dto.AssistantDtos;
import com.dmis.backend.audit.application.AuditService;
import com.dmis.backend.documents.application.DocumentUseCases;
import com.dmis.backend.documents.application.dto.DocumentDtos;
import com.dmis.backend.search.application.SearchService;
import com.dmis.backend.search.application.dto.SearchDtos;
import com.dmis.backend.shared.model.UserView;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

import static org.springframework.http.HttpStatus.FORBIDDEN;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class ContextAssemblyService {
    public static final String STATUS_OK = "OK";
    public static final String STATUS_NO_DOCUMENT_SELECTED = "NO_DOCUMENT_SELECTED";
    public static final String STATUS_DOCUMENT_NOT_FOUND = "DOCUMENT_NOT_FOUND";
    public static final String STATUS_ACCESS_DENIED = "ACCESS_DENIED";
    public static final String STATUS_TEXT_NOT_EXTRACTED = "TEXT_NOT_EXTRACTED";
    public static final String STATUS_INDEX_PENDING = "INDEX_PENDING";
    public static final String STATUS_INDEX_FAILED = "INDEX_FAILED";
    public static final String STATUS_NO_CHUNKS = "NO_CHUNKS";
    public static final String STATUS_NO_CONTEXT = "NO_CONTEXT";

    private final DocumentUseCases documentUseCases;
    private final SearchService searchService;
    private final AuditService auditService;
    private final AssistantContextProperties contextProperties;

    public ContextAssemblyService(
            DocumentUseCases documentUseCases,
            SearchService searchService,
            AuditService auditService,
            AssistantContextProperties contextProperties
    ) {
        this.documentUseCases = documentUseCases;
        this.searchService = searchService;
        this.auditService = auditService;
        this.contextProperties = contextProperties;
    }

    public PreparedDocumentContext prepareDocumentContext(
            UserView actor,
            String question,
            List<String> documentIds,
            ContextMode mode
    ) {
        auditService.append(
                actor.id(),
                "assistant.context.prepare",
                "assistant_context",
                actor.id(),
                "documentIds=" + safeIds(documentIds) + ", mode=" + mode
        );

        if (documentIds == null || documentIds.isEmpty()) {
            return blocked(
                    actor,
                    List.of(),
                    List.of(),
                    STATUS_NO_DOCUMENT_SELECTED,
                    STATUS_NO_DOCUMENT_SELECTED,
                    "Выберите документ или дождитесь привязки загруженного файла к диалогу.",
                    "assistant.context.no_document"
            );
        }

        List<String> limitedIds = documentIds.stream()
                .filter(id -> id != null && !id.isBlank())
                .map(String::trim)
                .distinct()
                .limit(contextProperties.maxDocuments())
                .toList();

        List<DocumentContextItem> documentItems = new ArrayList<>();
        for (String documentId : limitedIds) {
            DocumentContextItem item = loadDocumentContextItem(actor, documentId);
            if (item != null) {
                documentItems.add(item);
            }
        }

        if (documentItems.isEmpty()) {
            return blocked(
                    actor,
                    limitedIds,
                    documentItems,
                    STATUS_DOCUMENT_NOT_FOUND,
                    STATUS_DOCUMENT_NOT_FOUND,
                    "Документ не найден или недоступен.",
                    "assistant.context.no_document"
            );
        }

        DocumentContextItem blocking = findBlockingDocument(documentItems);
        if (blocking != null) {
            String status = blocking.diagnosticCode();
            String auditAction = switch (status) {
                case STATUS_INDEX_PENDING -> "assistant.context.index_pending";
                case STATUS_INDEX_FAILED -> "assistant.context.index_failed";
                case STATUS_NO_CHUNKS -> "assistant.context.no_chunks";
                case STATUS_TEXT_NOT_EXTRACTED -> "assistant.context.no_chunks";
                case STATUS_ACCESS_DENIED -> "assistant.context.no_document";
                default -> "assistant.context.no_document";
            };
            return blocked(
                    actor,
                    limitedIds,
                    documentItems,
                    status,
                    status,
                    blocking.diagnosticMessage(),
                    auditAction
            );
        }

        ContextMode effectiveMode = ContextModeDetector.detect(question, mode);
        if (effectiveMode == ContextMode.SUMMARY || effectiveMode == ContextMode.ANALYSIS) {
            PreparedDocumentContext summaryContext = buildSummaryContext(actor, limitedIds, documentItems);
            auditReady(actor, limitedIds, summaryContext);
            return summaryContext;
        }

        SearchDtos.SearchOnlyResponse searchResponse = searchService.searchInDocuments(actor, question, limitedIds);
        if (searchResponse.hits().isEmpty()) {
            PreparedDocumentContext noContext = new PreparedDocumentContext(
                    STATUS_NO_CONTEXT,
                    STATUS_NO_CONTEXT,
                    "Не найдено релевантных фрагментов в выбранных документах.",
                    limitedIds,
                    documentItems,
                    List.of(),
                    List.of(),
                    false
            );
            auditService.append(
                    actor.id(),
                    "assistant.context.no_context",
                    "assistant_context",
                    actor.id(),
                    buildAuditDetails(limitedIds, noContext)
            );
            return noContext;
        }

        ContextChunks chunks = mapSearchHitsToContext(searchResponse.hits());
        PreparedDocumentContext ready = new PreparedDocumentContext(
                STATUS_OK,
                STATUS_OK,
                null,
                limitedIds,
                documentItems,
                chunks.contextChunks(),
                chunks.sources(),
                true
        );
        auditReady(actor, limitedIds, ready);
        return ready;
    }

    public List<AssistantDtos.AssistantDocumentStatusView> documentStatuses(UserView actor, List<String> documentIds) {
        if (documentIds == null || documentIds.isEmpty()) {
            return List.of();
        }
        Set<String> unique = new LinkedHashSet<>();
        for (String documentId : documentIds) {
            if (documentId != null && !documentId.isBlank()) {
                unique.add(documentId.trim());
            }
        }
        List<AssistantDtos.AssistantDocumentStatusView> result = new ArrayList<>();
        for (String documentId : unique) {
            DocumentContextItem item = loadDocumentContextItem(actor, documentId);
            if (item != null) {
                result.add(toStatusView(item));
            }
        }
        return result;
    }

    public AssistantDtos.AssistantDocumentStatusView toStatusView(DocumentContextItem item) {
        return new AssistantDtos.AssistantDocumentStatusView(
                item.documentId(),
                item.title(),
                item.fileName(),
                item.indexStatus(),
                item.indexedChunkCount(),
                item.extractedTextLength(),
                item.indexedAt(),
                item.diagnosticCode(),
                item.diagnosticMessage()
        );
    }

    private PreparedDocumentContext buildSummaryContext(
            UserView actor,
            List<String> documentIds,
            List<DocumentContextItem> documentItems
    ) {
        List<String> contextChunks = new ArrayList<>();
        List<SearchDtos.RagSourceView> sources = new ArrayList<>();
        int maxChars = contextProperties.maxDocumentSummaryChars();

        if (contextProperties.summaryDirectTextEnabled()) {
            int usedChars = 0;
            for (String documentId : documentIds) {
                DocumentDtos.DocumentView document = documentUseCases.get(actor, documentId);
                String text = documentUseCases.getLatestExtractedText(actor, documentId);
                if (text == null || text.isBlank()) {
                    continue;
                }
                int remaining = maxChars - usedChars;
                if (remaining <= 0) {
                    break;
                }
                String chunk = text.length() > remaining ? text.substring(0, remaining) : text;
                contextChunks.add(chunk);
                sources.add(new SearchDtos.RagSourceView(
                        document.id(),
                        document.title(),
                        document.id() + "-full-text",
                        chunk,
                        1.0
                ));
                usedChars += chunk.length();
            }
        } else {
            SearchDtos.SearchOnlyResponse searchResponse = searchService.searchInDocuments(actor, "", documentIds);
            ContextChunks chunks = mapSearchHitsToContext(searchResponse.hits(), maxChars);
            contextChunks.addAll(chunks.contextChunks());
            sources.addAll(chunks.sources());
        }

        if (contextChunks.isEmpty()) {
            return new PreparedDocumentContext(
                    STATUS_NO_CHUNKS,
                    STATUS_NO_CHUNKS,
                    "Файл пустой или не содержит значимого текста для обработки.",
                    documentIds,
                    documentItems,
                    List.of(),
                    List.of(),
                    false
            );
        }

        return new PreparedDocumentContext(
                STATUS_OK,
                STATUS_OK,
                null,
                documentIds,
                documentItems,
                contextChunks,
                sources,
                true
        );
    }

    private DocumentContextItem loadDocumentContextItem(UserView actor, String documentId) {
        try {
            DocumentDtos.DocumentView document = documentUseCases.get(actor, documentId);
            return buildDocumentContextItem(document);
        } catch (ResponseStatusException exception) {
            if (exception.getStatusCode() == NOT_FOUND) {
                return null;
            }
            if (exception.getStatusCode() == FORBIDDEN) {
                return new DocumentContextItem(
                        documentId,
                        documentId,
                        "",
                        "UNKNOWN",
                        0,
                        0,
                        null,
                        STATUS_ACCESS_DENIED,
                        "Нет доступа к документу."
                );
            }
            throw exception;
        }
    }

    DocumentContextItem buildDocumentContextItem(DocumentDtos.DocumentView document) {
        String indexStatus = document.status() == null ? "UNKNOWN" : document.status().toUpperCase(Locale.ROOT);
        if ("PENDING".equals(indexStatus)) {
            return new DocumentContextItem(
                    document.id(),
                    document.title(),
                    document.fileName(),
                    indexStatus,
                    document.indexedChunkCount(),
                    document.extractedTextLength(),
                    document.indexedAt(),
                    STATUS_INDEX_PENDING,
                    "Документ ещё индексируется. Повторите запрос после завершения индексации."
            );
        }
        if ("FAILED".equals(indexStatus)) {
            return new DocumentContextItem(
                    document.id(),
                    document.title(),
                    document.fileName(),
                    indexStatus,
                    document.indexedChunkCount(),
                    document.extractedTextLength(),
                    document.indexedAt(),
                    STATUS_INDEX_FAILED,
                    "Документ не был проиндексирован. Проверьте извлечение текста и задачу индексации."
            );
        }
        if (document.extractedTextLength() <= 0) {
            return new DocumentContextItem(
                    document.id(),
                    document.title(),
                    document.fileName(),
                    indexStatus,
                    document.indexedChunkCount(),
                    document.extractedTextLength(),
                    document.indexedAt(),
                    STATUS_TEXT_NOT_EXTRACTED,
                    "Текст документа не извлечён."
            );
        }
        return new DocumentContextItem(
                document.id(),
                document.title(),
                document.fileName(),
                indexStatus,
                document.indexedChunkCount(),
                document.extractedTextLength(),
                document.indexedAt(),
                STATUS_OK,
                null
        );
    }

    private DocumentContextItem findBlockingDocument(List<DocumentContextItem> items) {
        for (DocumentContextItem item : items) {
            if (!STATUS_OK.equals(item.diagnosticCode())) {
                return item;
            }
        }
        return null;
    }

    private ContextChunks mapSearchHitsToContext(List<SearchDtos.SearchHitView> hits) {
        return mapSearchHitsToContext(hits, contextProperties.maxDocumentSummaryChars());
    }

    private ContextChunks mapSearchHitsToContext(List<SearchDtos.SearchHitView> hits, int maxChars) {
        List<String> contextChunks = new ArrayList<>();
        List<SearchDtos.RagSourceView> sources = new ArrayList<>();
        int usedChars = 0;
        for (SearchDtos.SearchHitView hit : hits) {
            if (usedChars >= maxChars) {
                break;
            }
            String chunkText = hit.chunkText() == null ? "" : hit.chunkText().trim();
            if (chunkText.isEmpty()) {
                continue;
            }
            int remaining = maxChars - usedChars;
            if (chunkText.length() > remaining) {
                chunkText = chunkText.substring(0, remaining);
            }
            contextChunks.add(chunkText);
            sources.add(new SearchDtos.RagSourceView(
                    hit.documentId(),
                    hit.documentTitle(),
                    hit.chunkId(),
                    chunkText,
                    hit.score()
            ));
            usedChars += chunkText.length();
        }
        return new ContextChunks(contextChunks, sources);
    }

    private PreparedDocumentContext blocked(
            UserView actor,
            List<String> documentIds,
            List<DocumentContextItem> documents,
            String status,
            String diagnosticCode,
            String userMessage,
            String auditAction
    ) {
        PreparedDocumentContext context = new PreparedDocumentContext(
                status,
                diagnosticCode,
                userMessage,
                documentIds,
                documents,
                List.of(),
                List.of(),
                false
        );
        auditService.append(
                actor.id(),
                auditAction,
                "assistant_context",
                actor.id(),
                buildAuditDetails(documentIds, context)
        );
        return context;
    }

    private void auditReady(UserView actor, List<String> documentIds, PreparedDocumentContext context) {
        auditService.append(
                actor.id(),
                "assistant.context.ready",
                "assistant_context",
                actor.id(),
                buildAuditDetails(documentIds, context)
        );
    }

    private String buildAuditDetails(List<String> documentIds, PreparedDocumentContext context) {
        int extractedTextLength = context.documents().stream().mapToInt(DocumentContextItem::extractedTextLength).sum();
        int indexedChunkCount = context.documents().stream().mapToInt(DocumentContextItem::indexedChunkCount).sum();
        return "documentIds=" + safeIds(documentIds)
                + ", contextStatus=" + context.status()
                + ", diagnosticCode=" + context.diagnosticCode()
                + ", retrievedCount=" + context.sources().size()
                + ", usedContextChunks=" + context.contextChunks().size()
                + ", indexedChunkCount=" + indexedChunkCount
                + ", extractedTextLength=" + extractedTextLength;
    }

    private static String safeIds(List<String> documentIds) {
        if (documentIds == null || documentIds.isEmpty()) {
            return "[]";
        }
        return documentIds.toString();
    }

    private record ContextChunks(List<String> contextChunks, List<SearchDtos.RagSourceView> sources) {
    }
}
