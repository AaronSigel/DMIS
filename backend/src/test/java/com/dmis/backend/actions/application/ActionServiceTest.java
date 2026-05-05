package com.dmis.backend.actions.application;

import com.dmis.backend.actions.application.dto.ActionDtos;
import com.dmis.backend.actions.application.port.AiActionPort;
import com.dmis.backend.actions.domain.ActionStatus;
import com.dmis.backend.audit.application.AuditService;
import com.dmis.backend.audit.application.dto.AuditView;
import com.dmis.backend.audit.application.port.AuditPort;
import com.dmis.backend.documents.application.DocumentUseCases;
import com.dmis.backend.integrations.application.IntegrationService;
import com.dmis.backend.shared.model.RoleName;
import com.dmis.backend.shared.model.UserView;
import com.dmis.backend.shared.security.AclService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
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
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;

class ActionServiceTest {
    private ActionService actionService;
    private UserView owner;
    private UserView outsider;
    private IntegrationService integrationService;
    private InMemoryAiActionPort aiActionPort;

    @BeforeEach
    void setUp() {
        aiActionPort = new InMemoryAiActionPort();
        AuditService auditService = new AuditService(new InMemoryAuditPort());
        integrationService = Mockito.mock(IntegrationService.class);
        DocumentUseCases documentUseCases = Mockito.mock(DocumentUseCases.class);
        actionService = new ActionService(aiActionPort, new AclService(), auditService, integrationService, documentUseCases);
        owner = new UserView("u-owner", "owner@dmis.local", "Owner", Set.of(RoleName.USER));
        outsider = new UserView("u-outsider", "out@dmis.local", "Out", Set.of(RoleName.USER));
    }

    @Test
    void executeRequiresConfirmedState() {
        ActionDtos.AiActionView draft = actionService.draft(owner, "send_mail", Map.of("to", "a@b.c"));
        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> actionService.execute(owner, draft.id()));
        assertTrue(exception.getReason().contains("confirmed"));
    }

    @Test
    void executeChecksActorAcl() {
        ActionDtos.AiActionView draft = actionService.draft(owner, "send_mail", Map.of("to", "a@b.c"));
        ActionDtos.AiActionView confirmed = actionService.confirm(owner, draft.id());
        assertEquals(ActionStatus.CONFIRMED, confirmed.status());
        assertThrows(ResponseStatusException.class, () -> actionService.execute(outsider, draft.id()));
    }

    @Test
    void listReturnsOnlyActorActionsForNonAdmin() {
        actionService.draft(owner, "send_mail", Map.of("to", "owner@dmis.local"));
        actionService.draft(outsider, "send_mail", Map.of("to", "out@dmis.local"));

        List<ActionDtos.AiActionView> ownerActions = actionService.list(owner);

        assertEquals(1, ownerActions.size());
        assertEquals(owner.id(), ownerActions.get(0).actorId());
    }

    @Test
    void executeSendEmailUsesSendPath() {
        ActionDtos.AiActionView draft = actionService.draft(owner, "send_email", Map.of(
                "to", "recipient@example.com",
                "subject", "Test",
                "body", "Hello"
        ));
        actionService.confirm(owner, draft.id());

        ActionDtos.AiActionView executed = actionService.execute(owner, draft.id());

        assertEquals(ActionStatus.EXECUTED, executed.status());
        verify(integrationService).sendMail(eq(owner), eq("recipient@example.com"), eq("Test"), eq("Hello"));
    }

    @Test
    void executeIntegrationFailureKeepsActionConfirmed() {
        ActionDtos.AiActionView draft = actionService.draft(owner, "create_calendar_event", Map.of(
                "title", "Standup",
                "attendees", "a@b.com,c@d.com",
                "startIso", "2026-05-10T09:00:00Z",
                "endIso", "2026-05-10T09:30:00Z"
        ));
        actionService.confirm(owner, draft.id());
        doThrow(new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Calendar service unavailable"))
                .when(integrationService)
                .sendCalendarEvent(eq(owner), eq("Standup"), anyList(), eq("2026-05-10T09:00:00Z"), eq("2026-05-10T09:30:00Z"));

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> actionService.execute(owner, draft.id()));

        assertEquals(HttpStatus.BAD_GATEWAY, exception.getStatusCode());
        assertTrue(exception.getReason().contains("Calendar service unavailable"));
        assertEquals(ActionStatus.CONFIRMED, aiActionPort.findById(draft.id()).orElseThrow().status());
        verify(integrationService).sendCalendarEvent(eq(owner), eq("Standup"), anyList(), eq("2026-05-10T09:00:00Z"), eq("2026-05-10T09:30:00Z"));
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
