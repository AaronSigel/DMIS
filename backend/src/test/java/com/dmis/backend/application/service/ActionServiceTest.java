package com.dmis.backend.actions.application;

import com.dmis.backend.actions.application.dto.ActionDtos;
import com.dmis.backend.actions.application.port.AiActionPort;
import com.dmis.backend.actions.domain.ActionStatus;
import com.dmis.backend.audit.application.AuditService;
import com.dmis.backend.audit.application.dto.AuditView;
import com.dmis.backend.audit.application.port.AuditPort;
import com.dmis.backend.shared.model.RoleName;
import com.dmis.backend.shared.model.UserView;
import com.dmis.backend.shared.security.AclService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import static org.junit.jupiter.api.Assertions.*;

class ActionServiceTest {
    private ActionService actionService;
    private UserView owner;
    private UserView outsider;

    @BeforeEach
    void setUp() {
        InMemoryAiActionPort aiActionPort = new InMemoryAiActionPort();
        AuditService auditService = new AuditService(new InMemoryAuditPort());
        actionService = new ActionService(aiActionPort, new AclService(), auditService);
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
