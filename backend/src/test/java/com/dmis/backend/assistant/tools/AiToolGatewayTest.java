package com.dmis.backend.assistant.tools;

import com.dmis.backend.actions.application.ActionService;
import com.dmis.backend.actions.application.IntentParserService;
import com.dmis.backend.actions.application.dto.ActionDtos;
import com.dmis.backend.actions.domain.ActionStatus;
import com.dmis.backend.assistant.application.ContextAssemblyService;
import com.dmis.backend.assistant.application.ContextMode;
import com.dmis.backend.assistant.application.PreparedDocumentContext;
import com.dmis.backend.assistant.application.dto.AssistantDtos;
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
import com.dmis.backend.users.application.dto.UserSummaryView;
import com.dmis.backend.users.application.port.UserAccessPort;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AiToolGatewayTest {
    private ContextAssemblyService contextAssemblyService;
    private IntentParserService intentParserService;
    private ActionService actionService;
    private DefaultAiToolGateway gateway;
    private UserView actor;

    @BeforeEach
    void setUp() {
        contextAssemblyService = Mockito.mock(ContextAssemblyService.class);
        DocumentUseCases documentUseCases = Mockito.mock(DocumentUseCases.class);
        SearchService searchService = Mockito.mock(SearchService.class);
        UserAccessPort userAccessPort = Mockito.mock(UserAccessPort.class);
        intentParserService = Mockito.mock(IntentParserService.class);
        actionService = Mockito.mock(ActionService.class);
        AuditService auditService = new AuditService(new NoopAuditPort(), new AclService(noopAccessPort()));
        gateway = new DefaultAiToolGateway(
                contextAssemblyService,
                documentUseCases,
                searchService,
                userAccessPort,
                intentParserService,
                actionService,
                auditService
        );
        actor = new UserView("u-admin", "admin@example.com", "Admin", Set.of(RoleName.ADMIN));

        when(documentUseCases.list(any(), any())).thenReturn(new DocumentDtos.PageResponse<>(List.of(), 0, 0, 0, 20));
        when(searchService.search(any(), anyString())).thenReturn(new SearchDtos.SearchOnlyResponse("q", "NO_RESULTS", List.of(), pipeline()));
        when(userAccessPort.findAllSummaries()).thenReturn(List.of(new UserSummaryView("u-1", "analyst@example.com", "analyst", "Analyst User")));
    }

    @Test
    void listToolsReturnsReadOnlyToolsExceptDraft() {
        List<AiToolDefinition> tools = gateway.listTools(actor);
        assertEquals(5, tools.size());
        assertTrue(tools.stream().filter(tool -> tool.name().equals("actions.prepare_draft")).findFirst().orElseThrow().requiresConfirmation());
        assertTrue(tools.stream().filter(AiToolDefinition::readOnly).count() >= 4);
    }

    @Test
    void documentsGetStatusUsesContextAssemblyService() {
        when(contextAssemblyService.documentStatuses(actor, List.of("doc-1"))).thenReturn(List.of(
                new AssistantDtos.AssistantDocumentStatusView("doc-1", "Doc", "doc.txt", "INDEXED", 2, 100, Instant.now(), "OK", null)
        ));
        AiToolCallResult result = gateway.call(actor, new AiToolCallRequest(
                "documents.get_status",
                Map.of("documentIds", List.of("doc-1")),
                "trace-1"
        ));
        assertTrue(result.success());
        verify(contextAssemblyService).documentStatuses(actor, List.of("doc-1"));
    }

    @Test
    void documentsGetContextDelegatesToContextAssemblyService() {
        when(contextAssemblyService.prepareDocumentContext(any(), eq("question"), eq(List.of("doc-1")), eq(ContextMode.SUMMARY)))
                .thenReturn(new PreparedDocumentContext("OK", "OK", null, List.of("doc-1"), List.of(), List.of("chunk"), List.of(), true));
        AiToolCallResult result = gateway.call(actor, new AiToolCallRequest(
                "documents.get_context",
                Map.of("documentIds", List.of("doc-1"), "question", "question", "mode", "SUMMARY"),
                "trace-2"
        ));
        assertTrue(result.success());
        verify(contextAssemblyService).prepareDocumentContext(any(), eq("question"), eq(List.of("doc-1")), eq(ContextMode.SUMMARY));
    }

    @Test
    void unknownToolReturnsControlledError() {
        AiToolCallResult result = gateway.call(actor, new AiToolCallRequest("unknown.tool", Map.of(), "trace-3"));
        assertFalse(result.success());
        assertEquals("UNKNOWN_TOOL", result.status());
    }

    @Test
    void invalidArgumentsReturnControlledError() {
        AiToolCallResult result = gateway.call(actor, new AiToolCallRequest("documents.get_status", Map.of(), "trace-4"));
        assertFalse(result.success());
        assertEquals("INVALID_ARGUMENTS", result.status());
    }

    @Test
    void prepareDraftCreatesDraftOnly() {
        when(intentParserService.parseDraft("send mail", List.of())).thenReturn(
                new IntentParserService.ParsedDraft("send_email", new ActionDtos.SendEmailEntities("a@b.c", "s", "b"))
        );
        when(actionService.draft(any(), eq("send_email"), any())).thenReturn(
                new ActionDtos.AiActionView(
                        "action-1",
                        "send_email",
                        new ActionDtos.SendEmailEntities("a@b.c", "s", "b"),
                        "u-admin",
                        ActionStatus.DRAFT,
                        null,
                        null
                )
        );
        AiToolCallResult result = gateway.call(actor, new AiToolCallRequest(
                "actions.prepare_draft",
                Map.of("userText", "send mail"),
                "trace-5"
        ));
        assertTrue(result.success());
        verify(actionService).draft(any(), eq("send_email"), any());
        verify(actionService, never()).confirm(any(), any());
        verify(actionService, never()).execute(any(), any());
    }

    private static SearchDtos.SearchPipelineMeta pipeline() {
        return new SearchDtos.SearchPipelineMeta(7, 3, 0, 0, 0, 0, 0);
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
