package com.dmis.backend.actions.application;

import com.dmis.backend.actions.application.dto.ActionDtos;
import com.dmis.backend.actions.application.port.AiActionPort;
import com.dmis.backend.actions.domain.ActionStatus;
import com.dmis.backend.audit.application.AuditService;
import com.dmis.backend.shared.model.UserView;
import com.dmis.backend.shared.security.AclService;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
import java.util.UUID;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.FORBIDDEN;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class ActionService {
    private final AiActionPort aiActionPort;
    private final AclService aclService;
    private final AuditService auditService;

    public ActionService(AiActionPort aiActionPort, AclService aclService, AuditService auditService) {
        this.aiActionPort = aiActionPort;
        this.aclService = aclService;
        this.auditService = auditService;
    }

    public ActionDtos.AiActionView draft(UserView actor, String intent, Map<String, String> entities) {
        ActionDtos.AiActionView action = new ActionDtos.AiActionView(
                "act-" + UUID.randomUUID(),
                intent,
                entities,
                actor.id(),
                ActionStatus.DRAFT,
                null
        );
        ActionDtos.AiActionView saved = aiActionPort.save(action);
        auditService.append(actor.id(), "action.draft", "ai_action", saved.id(), "Draft created");
        return saved;
    }

    public ActionDtos.AiActionView confirm(UserView actor, String actionId) {
        ActionDtos.AiActionView action = aiActionPort.findById(actionId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Action not found"));
        ActionDtos.AiActionView confirmed = new ActionDtos.AiActionView(
                action.id(),
                action.intent(),
                action.entities(),
                action.actorId(),
                ActionStatus.CONFIRMED,
                actor.id()
        );
        ActionDtos.AiActionView saved = aiActionPort.save(confirmed);
        auditService.append(actor.id(), "action.confirm", "ai_action", saved.id(), "Action confirmed");
        return saved;
    }

    public ActionDtos.AiActionView execute(UserView actor, String actionId) {
        ActionDtos.AiActionView action = aiActionPort.findById(actionId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Action not found"));
        if (action.status() != ActionStatus.CONFIRMED) {
            throw new ResponseStatusException(BAD_REQUEST, "Action must be confirmed before execution");
        }
        if (!action.actorId().equals(actor.id()) && !aclService.isAdmin(actor)) {
            throw new ResponseStatusException(FORBIDDEN, "No permission to execute action");
        }
        ActionDtos.AiActionView executed = new ActionDtos.AiActionView(
                action.id(),
                action.intent(),
                action.entities(),
                action.actorId(),
                ActionStatus.EXECUTED,
                action.confirmedBy()
        );
        ActionDtos.AiActionView saved = aiActionPort.save(executed);
        auditService.append(actor.id(), "action.execute", "ai_action", saved.id(), "Action executed");
        return saved;
    }
}
