package com.dmis.backend.assistant.application;

import com.dmis.backend.assistant.application.dto.AssistantDtos;
import com.dmis.backend.assistant.application.port.AssistantPort;
import com.dmis.backend.audit.application.AuditService;
import com.dmis.backend.audit.application.dto.AuditView;
import com.dmis.backend.audit.application.port.AuditPort;
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

import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AssistantServiceContextTest {
    private AssistantPort assistantPort;
    private ContextAssemblyService contextAssemblyService;
    private SearchService searchService;
    private com.dmis.backend.documents.application.DocumentUseCases documentUseCases;
    private AssistantRagOrchestrator orchestrator;
    private AssistantService assistantService;
    private UserView actor;

    @BeforeEach
    void setUp() {
        assistantPort = Mockito.mock(AssistantPort.class);
        contextAssemblyService = Mockito.mock(ContextAssemblyService.class);
        searchService = Mockito.mock(SearchService.class);
        documentUseCases = Mockito.mock(com.dmis.backend.documents.application.DocumentUseCases.class);
        AuditService auditService = new AuditService(new NoopAuditPort(), new AclService(noopAccessPort()));
        orchestrator = new AssistantRagOrchestrator(assistantPort, contextAssemblyService, searchService);
        assistantService = new AssistantService(
                assistantPort,
                documentUseCases,
                searchService,
                new AclService(noopAccessPort()),
                auditService,
                Mockito.mock(com.dmis.backend.assistant.application.port.ThreadTitleGeneratorPort.class),
                Mockito.mock(com.dmis.backend.actions.application.IntentParserService.class),
                Mockito.mock(com.dmis.backend.actions.application.ActionService.class),
                contextAssemblyService,
                orchestrator,
                new AssistantRequestRouter(),
                new com.dmis.backend.actions.application.ActionDraftBuilder(
                        new com.dmis.backend.actions.application.UserMentionResolver(
                                Mockito.mock(com.dmis.backend.users.application.port.UserAccessPort.class)
                        )
                ),
                null
        );
        actor = new UserView("u-admin", "admin@example.com", "Admin", Set.of(RoleName.ADMIN));
    }

    @Test
    void requestDocumentIdsHavePriorityOverLinkedDocuments() {
        when(assistantPort.findThreadById("thread-1")).thenReturn(java.util.Optional.of(thread("thread-1")));
        when(assistantPort.findLinkedDocumentIds("thread-1")).thenReturn(List.of("doc-linked"));
        when(documentUseCases.get(actor, "doc-requested")).thenReturn(docView("doc-requested", "INDEXED"));
        when(contextAssemblyService.prepareDocumentContext(any(), any(), eq(List.of("doc-requested")), any()))
                .thenReturn(readyContext(List.of("doc-requested")));
        when(searchService.prepareAnswerFromContext(any(), any(), any(), any(), any(), any()))
                .thenReturn(preparedAnswer("OK", "answer"));
        when(searchService.resolveSummarySystemPrompt()).thenReturn("summary prompt");
        when(searchService.completePreparedAnswer(any(), any()))
                .thenReturn(new SearchDtos.AnswerWithSourcesResponse(
                        "summary",
                        "OK",
                        "answer",
                        List.of(),
                        pipeline()
                ));
        when(assistantPort.saveMessage(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(assistantPort.saveThread(any())).thenAnswer(invocation -> invocation.getArgument(0));

        assistantService.sendMessage(actor, "thread-1", "summary", List.of("doc-requested"), List.of("documents"), "balanced");

        verify(contextAssemblyService).prepareDocumentContext(any(), eq("summary"), eq(List.of("doc-requested")), any());
    }

    @Test
    void pendingDocumentReturnsDiagnosticWithoutLlm() {
        when(assistantPort.findThreadById("thread-1")).thenReturn(java.util.Optional.of(thread("thread-1")));
        when(documentUseCases.get(actor, "doc-pending")).thenReturn(docView("doc-pending", "PENDING"));
        when(contextAssemblyService.prepareDocumentContext(any(), any(), eq(List.of("doc-pending")), any()))
                .thenReturn(new PreparedDocumentContext(
                        ContextAssemblyService.STATUS_INDEX_PENDING,
                        ContextAssemblyService.STATUS_INDEX_PENDING,
                        "Документ ещё индексируется.",
                        List.of("doc-pending"),
                        List.of(),
                        List.of(),
                        List.of(),
                        false
                ));
        when(assistantPort.saveMessage(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(assistantPort.saveThread(any())).thenAnswer(invocation -> invocation.getArgument(0));

        AssistantDtos.SendMessageResult result = assistantService.sendMessage(
                actor,
                "thread-1",
                "summary",
                List.of("doc-pending"),
                List.of("documents"),
                "balanced"
        );

        assertEquals(ContextAssemblyService.STATUS_INDEX_PENDING, result.contextDiagnosticCode());
        assertFalse(result.rag().answer().contains("Не найдено релевантных"));
        verify(searchService, Mockito.never()).completePreparedAnswer(any(), any());
    }

    private static PreparedDocumentContext readyContext(List<String> ids) {
        return new PreparedDocumentContext(
                ContextAssemblyService.STATUS_OK,
                ContextAssemblyService.STATUS_OK,
                null,
                ids,
                List.of(),
                List.of("chunk"),
                List.of(new SearchDtos.RagSourceView(ids.get(0), "Doc", "c-1", "chunk", 1.0)),
                true
        );
    }

    private static SearchService.PreparedAnswer preparedAnswer(String status, String fallback) {
        return new SearchService.PreparedAnswer(
                "summary",
                status,
                fallback,
                List.of(),
                List.of("chunk"),
                pipeline(),
                "prompt",
                "rag-1"
        );
    }

    private static SearchDtos.AnswerPipelineMeta pipeline() {
        return new SearchDtos.AnswerPipelineMeta(7, 3, 3, 3000, 1, 1, 1, 10, false, 1, 1, 1L, 2);
    }

    private static AssistantDtos.ThreadView thread(String id) {
        return new AssistantDtos.ThreadView(id, "u-admin", "Thread", "balanced", List.of("documents"), java.time.Instant.now(), java.time.Instant.now());
    }

    private static com.dmis.backend.documents.application.dto.DocumentDtos.DocumentView docView(String id, String status) {
        return new com.dmis.backend.documents.application.dto.DocumentDtos.DocumentView(
                id,
                "Title",
                "u-admin",
                "",
                List.of(),
                "upload",
                "general",
                status,
                "file",
                java.time.Instant.now(),
                java.time.Instant.now(),
                100L,
                id + ".txt",
                "text/plain",
                "storage://" + id,
                status.equals("INDEXED") ? 2 : 0,
                java.time.Instant.now(),
                "preview",
                200,
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
