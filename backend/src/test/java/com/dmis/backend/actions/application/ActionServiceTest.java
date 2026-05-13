package com.dmis.backend.actions.application;

import com.dmis.backend.actions.application.dto.ActionDtos;
import com.dmis.backend.actions.application.dto.ActionDtos.CreateCalendarEventEntities;
import com.dmis.backend.actions.application.dto.ActionDtos.SendEmailEntities;
import com.dmis.backend.actions.application.dto.ActionDtos.UpdateDocumentTagsEntities;
import com.dmis.backend.actions.application.UserMentionResolver;
import com.dmis.backend.actions.application.port.AiActionPort;
import com.dmis.backend.actions.domain.ActionStatus;
import com.dmis.backend.audit.application.AuditService;
import com.dmis.backend.audit.application.dto.AuditView;
import com.dmis.backend.audit.application.port.AuditPort;
import com.dmis.backend.documents.application.DocumentUseCases;
import com.dmis.backend.documents.application.dto.DocumentDtos;
import com.dmis.backend.documents.application.port.DocumentAccessPort;
import com.dmis.backend.integrations.application.IntegrationService;
import com.dmis.backend.integrations.application.dto.IntegrationDtos;
import com.dmis.backend.integrations.domain.model.EventCreationSource;
import com.dmis.backend.shared.model.RoleName;
import com.dmis.backend.shared.model.UserView;
import com.dmis.backend.shared.security.AclService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ActionServiceTest {
    private ActionService actionService;
    private UserView owner;
    private UserView outsider;
    private IntegrationService integrationService;
    private DocumentUseCases documentUseCases;
    private UserMentionResolver userMentionResolver;
    private InMemoryAiActionPort aiActionPort;

    @BeforeEach
    void setUp() {
        aiActionPort = new InMemoryAiActionPort();
        AuditService auditService = new AuditService(new InMemoryAuditPort());
        integrationService = Mockito.mock(IntegrationService.class);
        documentUseCases = Mockito.mock(DocumentUseCases.class);
        userMentionResolver = Mockito.mock(UserMentionResolver.class);
        when(userMentionResolver.resolve(anyString())).thenAnswer(invocation -> invocation.getArgument(0));
        actionService = new ActionService(
                aiActionPort,
                new AclService(noopAccessPort()),
                auditService,
                integrationService,
                documentUseCases,
                userMentionResolver,
                10,
                26_214_400L
        );
        owner = new UserView("u-owner", "owner@example.com", "Owner", Set.of(RoleName.USER));
        outsider = new UserView("u-outsider", "out@example.com", "Out", Set.of(RoleName.USER));
    }

    @Test
    void executeRequiresConfirmedState() {
        ActionDtos.AiActionView draft = actionService.draft(
                owner,
                "send_email",
                new SendEmailEntities("a@b.c", "Subj", "Body")
        );
        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> actionService.execute(owner, draft.id()));
        assertTrue(exception.getReason().contains("confirmed"));
    }

    @Test
    void executeChecksActorAcl() {
        ActionDtos.AiActionView draft = actionService.draft(
                owner,
                "send_email",
                new SendEmailEntities("a@b.c", "Subj", "Body")
        );
        ActionDtos.AiActionView confirmed = actionService.confirm(owner, draft.id());
        assertEquals(ActionStatus.CONFIRMED, confirmed.status());
        assertThrows(ResponseStatusException.class, () -> actionService.execute(outsider, draft.id()));
    }

    @Test
    void listReturnsOnlyActorActionsForNonAdmin() {
        actionService.draft(owner, "send_email", new SendEmailEntities("owner@example.com", "Subj", "Body"));
        actionService.draft(outsider, "send_email", new SendEmailEntities("out@example.com", "Subj", "Body"));

        List<ActionDtos.AiActionView> ownerActions = actionService.list(owner);

        assertEquals(1, ownerActions.size());
        assertEquals(owner.id(), ownerActions.get(0).actorId());
    }

    @Test
    void executeSendEmailUsesSendPath() {
        ActionDtos.AiActionView draft = actionService.draft(
                owner,
                "send_email",
                new SendEmailEntities("recipient@example.com", "Test", "Hello")
        );
        actionService.confirm(owner, draft.id());

        ActionDtos.AiActionView executed = actionService.execute(owner, draft.id());

        assertEquals(ActionStatus.EXECUTED, executed.status());
        verify(integrationService).sendMail(
                eq(owner),
                eq("recipient@example.com"),
                eq("Test"),
                eq("Hello"),
                eq("action:" + draft.id()),
                eq(List.of())
        );
    }

    @Test
    void repeatedExecuteReturnsExecutedWithoutDuplicateSideEffects() {
        ActionDtos.AiActionView draft = actionService.draft(
                owner,
                "send_email",
                new SendEmailEntities("recipient@example.com", "Test", "Hello")
        );
        actionService.confirm(owner, draft.id());

        ActionDtos.AiActionView firstExecute = actionService.execute(owner, draft.id());
        ActionDtos.AiActionView secondExecute = actionService.execute(owner, draft.id());

        assertEquals(ActionStatus.EXECUTED, firstExecute.status());
        assertEquals(ActionStatus.EXECUTED, secondExecute.status());
        verify(integrationService).sendMail(
                eq(owner),
                eq("recipient@example.com"),
                eq("Test"),
                eq("Hello"),
                eq("action:" + draft.id()),
                eq(List.of())
        );
    }

    @Test
    void executeIntegrationFailureKeepsActionConfirmed() {
        ActionDtos.AiActionView draft = actionService.draft(
                owner,
                "create_calendar_event",
                new CreateCalendarEventEntities(
                        "Standup",
                        List.of("a@b.com", "c@d.com"),
                        "2026-05-10T09:00:00Z",
                        "2026-05-10T09:30:00Z"
                )
        );
        actionService.confirm(owner, draft.id());
        doThrow(new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Calendar service unavailable"))
                .when(integrationService)
                .createCalendarEvent(
                        eq(owner),
                        eq("Standup"),
                        anyList(),
                        eq("2026-05-10T09:00:00Z"),
                        eq("2026-05-10T09:30:00Z"),
                        eq(""),
                        eq(EventCreationSource.AI_ACTION),
                        isNull()
                );

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> actionService.execute(owner, draft.id()));

        assertEquals(HttpStatus.BAD_GATEWAY, exception.getStatusCode());
        assertTrue(exception.getReason().contains("Calendar service unavailable"));
        assertEquals(ActionStatus.CONFIRMED, aiActionPort.findById(draft.id()).orElseThrow().status());
        verify(integrationService).createCalendarEvent(
                eq(owner),
                eq("Standup"),
                anyList(),
                eq("2026-05-10T09:00:00Z"),
                eq("2026-05-10T09:30:00Z"),
                eq(""),
                eq(EventCreationSource.AI_ACTION),
                isNull()
        );
    }

    @Test
    void executeSendEmailResolvesDocumentAttachments() {
        when(documentUseCases.downloadLatest(eq(owner), eq("doc-1")))
                .thenReturn(new DocumentDtos.DocumentBinary("f.pdf", "application/pdf", new byte[]{1, 2, 3}));

        ActionDtos.AiActionView draft = actionService.draft(
                owner,
                "send_email",
                new SendEmailEntities("recipient@example.com", "Test", "Hello", List.of("doc-1"))
        );
        actionService.confirm(owner, draft.id());
        actionService.execute(owner, draft.id());

        @SuppressWarnings("unchecked")
        ArgumentCaptor<List<IntegrationDtos.MailAttachment>> captor = ArgumentCaptor.forClass(List.class);
        verify(integrationService).sendMail(
                eq(owner),
                eq("recipient@example.com"),
                eq("Test"),
                eq("Hello"),
                eq("action:" + draft.id()),
                captor.capture()
        );
        assertEquals(1, captor.getValue().size());
        assertEquals("f.pdf", captor.getValue().getFirst().fileName());
        assertEquals("application/pdf", captor.getValue().getFirst().contentType());
    }

    @Test
    void draftRejectsUnsupportedIntent() {
        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> actionService.draft(owner, "unknown_intent", new SendEmailEntities("a@b.com", "S", "B"))
        );

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        assertTrue(exception.getReason().contains("Unsupported intent"));
    }

    @Test
    void draftRejectsMismatchedEntitiesType() {
        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> actionService.draft(
                        owner,
                        "send_email",
                        new UpdateDocumentTagsEntities("doc-1", List.of("tag"))
                )
        );

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        assertTrue(exception.getReason().contains("Entities type does not match intent"));
    }

    private static DocumentAccessPort noopAccessPort() {
        return new DocumentAccessPort() {
            @Override
            public Optional<com.dmis.backend.documents.domain.DocumentAccessLevel> findLevel(String documentId, String principalId) {
                return Optional.empty();
            }

            @Override
            public List<String> findAccessibleDocumentIds(String principalId) {
                return List.of();
            }
        };
    }

    private static class InMemoryAiActionPort implements AiActionPort {
        private final Map<String, ActionDtos.AiActionView> storage = new ConcurrentHashMap<>();

        @Override
        public ActionDtos.AiActionView save(ActionDtos.AiActionView action) {
            storage.put(action.id(), action);
            return action;
        }

        @Override
        public Optional<ActionDtos.AiActionView> findById(String id) {
            return Optional.ofNullable(storage.get(id));
        }

        @Override
        public List<ActionDtos.AiActionView> findAll() {
            return storage.values().stream().toList();
        }
    }

    private static class InMemoryAuditPort implements AuditPort {
        @Override
        public void append(AuditView auditView) {
        }

        @Override
        public java.util.List<AuditView> findAll() {
            return java.util.List.of();
        }
    }
}
