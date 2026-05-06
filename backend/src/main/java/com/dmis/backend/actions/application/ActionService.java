package com.dmis.backend.actions.application;

import com.dmis.backend.actions.application.dto.ActionDtos;
import com.dmis.backend.actions.application.dto.ActionDtos.ActionEntities;
import com.dmis.backend.actions.application.dto.ActionDtos.CreateCalendarEventEntities;
import com.dmis.backend.actions.application.dto.ActionDtos.SendEmailEntities;
import com.dmis.backend.actions.application.dto.ActionDtos.UpdateDocumentTagsEntities;
import com.dmis.backend.actions.application.port.AiActionPort;
import com.dmis.backend.actions.domain.ActionStatus;
import com.dmis.backend.audit.application.AuditService;
import com.dmis.backend.documents.application.DocumentUseCases;
import com.dmis.backend.documents.application.dto.DocumentDtos;
import com.dmis.backend.integrations.application.IntegrationService;
import com.dmis.backend.shared.model.UserView;
import com.dmis.backend.shared.security.AclService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.FORBIDDEN;
import static org.springframework.http.HttpStatus.CONFLICT;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class ActionService {
    private static final Set<String> SUPPORTED_INTENTS = Set.of(
            "send_email",
            "create_calendar_event",
            "update_document_tags"
    );

    private final AiActionPort aiActionPort;
    private final AclService aclService;
    private final AuditService auditService;
    private final IntegrationService integrationService;
    private final DocumentUseCases documentUseCases;

    public ActionService(AiActionPort aiActionPort, AclService aclService, AuditService auditService,
                         IntegrationService integrationService, DocumentUseCases documentUseCases) {
        this.aiActionPort = aiActionPort;
        this.aclService = aclService;
        this.auditService = auditService;
        this.integrationService = integrationService;
        this.documentUseCases = documentUseCases;
    }

    public ActionDtos.AiActionView draft(UserView actor, String intent, ActionEntities entities) {
        validateIntent(intent);
        validateEntitiesMatchIntent(intent, entities);
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

    public List<ActionDtos.AiActionView> list(UserView actor) {
        List<ActionDtos.AiActionView> actions = aiActionPort.findAll();
        if (aclService.isAdmin(actor)) {
            return actions;
        }
        return actions.stream()
                .filter(action -> action.actorId().equals(actor.id()))
                .toList();
    }

    public ActionDtos.AiActionView confirm(UserView actor, String actionId) {
        ActionDtos.AiActionView action = aiActionPort.findById(actionId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Action not found"));
        if (!action.actorId().equals(actor.id()) && !aclService.isAdmin(actor)) {
            throw new ResponseStatusException(FORBIDDEN, "No permission to confirm action");
        }
        if (action.status() != ActionStatus.DRAFT) {
            throw new ResponseStatusException(CONFLICT, "Action is not in DRAFT state");
        }
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
        try {
            dispatch(actor, action);
            ActionDtos.AiActionView executed = new ActionDtos.AiActionView(
                    action.id(),
                    action.intent(),
                    action.entities(),
                    action.actorId(),
                    ActionStatus.EXECUTED,
                    action.confirmedBy()
            );
            ActionDtos.AiActionView saved = aiActionPort.save(executed);
            auditService.append(actor.id(), "action.execute", "ai_action", saved.id(), "Action executed successfully");
            return saved;
        } catch (ResponseStatusException ex) {
            auditService.append(actor.id(), "action.execute.failed", "ai_action", action.id(),
                    "Execution failed: " + ex.getReason());
            throw ex;
        } catch (Exception ex) {
            auditService.append(actor.id(), "action.execute.failed", "ai_action", action.id(),
                    "Execution failed: " + ex.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Execution failed for action '" + action.id() + "': " + ex.getMessage(), ex);
        }
    }

    private void dispatch(UserView actor, ActionDtos.AiActionView action) {
        validateIntent(action.intent());
        validateEntitiesMatchIntent(action.intent(), action.entities());
        try {
            switch (action.intent()) {
                case "send_email" -> {
                    SendEmailEntities entities = (SendEmailEntities) action.entities();
                    integrationService.sendMail(actor, entities.to(), entities.subject(), entities.body());
                }
                case "create_calendar_event" -> {
                    CreateCalendarEventEntities entities = (CreateCalendarEventEntities) action.entities();
                    integrationService.sendCalendarEvent(
                            actor,
                            entities.title(),
                            entities.attendees(),
                            entities.startIso(),
                            entities.endIso()
                    );
                }
                case "update_document_tags" -> {
                    UpdateDocumentTagsEntities entities = (UpdateDocumentTagsEntities) action.entities();
                    documentUseCases.patch(
                            actor,
                            entities.documentId(),
                            new DocumentDtos.PatchDocumentRequest(
                                    entities.tags(),
                                    null,
                                    null
                            )
                    );
                }
                default -> throw new ResponseStatusException(BAD_REQUEST, "Unsupported intent: " + action.intent());
            }
        } catch (ResponseStatusException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Dispatch failed for intent '" + action.intent() + "': " + ex.getMessage(), ex);
        }
    }

    private static void validateIntent(String intent) {
        if (SUPPORTED_INTENTS.contains(intent)) {
            return;
        }
        throw new ResponseStatusException(
                BAD_REQUEST,
                "Unsupported intent: " + intent + ". Supported intents: " + String.join(", ", new LinkedHashSet<>(SUPPORTED_INTENTS))
        );
    }

    private static void validateEntitiesMatchIntent(String intent, ActionEntities entities) {
        if (entities == null) {
            throw new ResponseStatusException(BAD_REQUEST, "Entities are required");
        }
        boolean matches = switch (intent) {
            case "send_email" -> entities instanceof SendEmailEntities;
            case "create_calendar_event" -> entities instanceof CreateCalendarEventEntities;
            case "update_document_tags" -> entities instanceof UpdateDocumentTagsEntities;
            default -> false;
        };
        if (!matches) {
            throw new ResponseStatusException(BAD_REQUEST, "Entities type does not match intent: " + intent);
        }
    }
}
