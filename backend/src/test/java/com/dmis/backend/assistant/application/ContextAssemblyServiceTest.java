package com.dmis.backend.assistant.application;

import com.dmis.backend.audit.application.AuditService;
import com.dmis.backend.audit.application.dto.AuditView;
import com.dmis.backend.audit.application.port.AuditPort;
import com.dmis.backend.documents.application.DocumentUseCases;
import com.dmis.backend.documents.application.dto.DocumentDtos;
import com.dmis.backend.documents.application.port.DocumentAccessPort;
import com.dmis.backend.documents.domain.DocumentAccessLevel;
import com.dmis.backend.search.application.SearchService;
import com.dmis.backend.search.application.dto.SearchDtos;
import com.dmis.backend.shared.model.RoleName;
import com.dmis.backend.shared.model.UserView;
import com.dmis.backend.shared.security.AclService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

class ContextAssemblyServiceTest {
    private DocumentUseCases documentUseCases;
    private SearchService searchService;
    private ContextAssemblyService service;
    private UserView actor;

    @BeforeEach
    void setUp() {
        documentUseCases = Mockito.mock(DocumentUseCases.class);
        searchService = Mockito.mock(SearchService.class);
        AuditService auditService = new AuditService(new NoopAuditPort(), new AclService(noopAccessPort()));
        AssistantContextProperties properties = new AssistantContextProperties(12_000, 5, true);
        service = new ContextAssemblyService(documentUseCases, searchService, auditService, properties);
        actor = new UserView("u-admin", "admin@example.com", "Admin", Set.of(RoleName.ADMIN));
    }

    @Test
    void noDocumentSelectedWhenIdsEmpty() {
        PreparedDocumentContext context = service.prepareDocumentContext(actor, "summary", List.of(), ContextMode.SUMMARY);
        assertEquals(ContextAssemblyService.STATUS_NO_DOCUMENT_SELECTED, context.status());
        assertFalse(context.llmAllowed());
    }

    @Test
    void indexPendingBlocksLlm() {
        when(documentUseCases.get(actor, "doc-pending")).thenReturn(document("doc-pending", "PENDING", 0, 100));
        PreparedDocumentContext context = service.prepareDocumentContext(actor, "summary", List.of("doc-pending"), ContextMode.SUMMARY);
        assertEquals(ContextAssemblyService.STATUS_INDEX_PENDING, context.status());
        assertFalse(context.llmAllowed());
    }

    @Test
    void indexFailedBlocksLlm() {
        when(documentUseCases.get(actor, "doc-failed")).thenReturn(document("doc-failed", "FAILED", 0, 100));
        PreparedDocumentContext context = service.prepareDocumentContext(actor, "summary", List.of("doc-failed"), ContextMode.SUMMARY);
        assertEquals(ContextAssemblyService.STATUS_INDEX_FAILED, context.status());
        assertFalse(context.llmAllowed());
    }

    @Test
    void textNotExtractedBlocksLlm() {
        when(documentUseCases.get(actor, "doc-empty")).thenReturn(document("doc-empty", "INDEXED", 3, 0));
        PreparedDocumentContext context = service.prepareDocumentContext(actor, "summary", List.of("doc-empty"), ContextMode.SUMMARY);
        assertEquals(ContextAssemblyService.STATUS_TEXT_NOT_EXTRACTED, context.status());
        assertFalse(context.llmAllowed());
    }

    @Test
    void summaryWithExtractedTextButNoChunksAllowsLlm() {
        when(documentUseCases.get(actor, "doc-no-chunks")).thenReturn(document("doc-no-chunks", "INDEXED", 0, 100));
        when(documentUseCases.getLatestExtractedText(actor, "doc-no-chunks")).thenReturn("Some text without indexed chunks.");
        PreparedDocumentContext context = service.prepareDocumentContext(actor, "summary", List.of("doc-no-chunks"), ContextMode.SUMMARY);
        assertEquals(ContextAssemblyService.STATUS_OK, context.status());
        assertTrue(context.llmAllowed());
        assertFalse(context.contextChunks().isEmpty());
    }

    @Test
    void whitespaceOnlyExtractedTextFailsSummaryWithNoChunks() {
        when(documentUseCases.get(actor, "doc-whitespace")).thenReturn(document("doc-whitespace", "INDEXED", 0, 2));
        when(documentUseCases.getLatestExtractedText(actor, "doc-whitespace")).thenReturn("  ");
        PreparedDocumentContext context = service.prepareDocumentContext(actor, "summary", List.of("doc-whitespace"), ContextMode.SUMMARY);
        assertEquals(ContextAssemblyService.STATUS_NO_CHUNKS, context.status());
        assertFalse(context.llmAllowed());
    }

    @Test
    void indexedDocumentAllowsSummary() {
        when(documentUseCases.get(actor, "doc-ok")).thenReturn(document("doc-ok", "INDEXED", 3, 500));
        when(documentUseCases.getLatestExtractedText(actor, "doc-ok")).thenReturn("Sample extracted text for summary.");
        PreparedDocumentContext context = service.prepareDocumentContext(actor, "summary", List.of("doc-ok"), ContextMode.SUMMARY);
        assertEquals(ContextAssemblyService.STATUS_OK, context.status());
        assertTrue(context.llmAllowed());
        assertFalse(context.contextChunks().isEmpty());
    }

    @Test
    void aclDeniedDocumentIsSkippedInStatusEndpoint() {
        when(documentUseCases.get(actor, "doc-foreign"))
                .thenThrow(new ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "Document not found"));
        assertTrue(service.documentStatuses(actor, List.of("doc-foreign")).isEmpty());
    }

    @Test
    void questionAnswerUsesSearchInDocuments() {
        when(documentUseCases.get(actor, "doc-ok")).thenReturn(document("doc-ok", "INDEXED", 2, 200));
        when(searchService.searchInDocuments(actor, "policy", List.of("doc-ok")))
                .thenReturn(new SearchDtos.SearchOnlyResponse(
                        "policy",
                        "OK",
                        List.of(new SearchDtos.SearchHitView("doc-ok", "Doc", "c-1", "policy text", 0.9)),
                        new SearchDtos.SearchPipelineMeta(7, 3, 1, 1, 1, 1, 1)
                ));
        PreparedDocumentContext context = service.prepareDocumentContext(actor, "policy", List.of("doc-ok"), ContextMode.QUESTION_ANSWER);
        assertEquals(ContextAssemblyService.STATUS_OK, context.status());
        assertTrue(context.llmAllowed());
    }

    private static DocumentDtos.DocumentView document(
            String id,
            String status,
            int chunks,
            int extractedLength
    ) {
        return new DocumentDtos.DocumentView(
                id,
                "Title " + id,
                "u-admin",
                "",
                List.of(),
                "upload",
                "general",
                status,
                "file",
                Instant.now(),
                Instant.now(),
                100L,
                id + ".txt",
                "text/plain",
                "storage://" + id,
                chunks,
                Instant.now(),
                "preview",
                extractedLength,
                false
        );
    }

    private static DocumentAccessPort noopAccessPort() {
        return new DocumentAccessPort() {
            @Override
            public Optional<DocumentAccessLevel> findLevel(String documentId, String principalId) {
                return Optional.of(DocumentAccessLevel.READ);
            }

            @Override
            public List<String> findAccessibleDocumentIds(String principalId) {
                return List.of();
            }
        };
    }

    private static final class NoopAuditPort implements AuditPort {
        @Override
        public void append(AuditView auditView) {
        }

        @Override
        public List<AuditView> findAll() {
            return List.of();
        }

        @Override
        public List<AuditView> findByActorId(String actorId) {
            return List.of();
        }
    }
}
