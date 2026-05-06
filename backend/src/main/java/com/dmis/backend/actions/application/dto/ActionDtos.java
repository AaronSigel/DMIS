package com.dmis.backend.actions.application.dto;

import com.dmis.backend.actions.domain.ActionStatus;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import jakarta.validation.Valid;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.time.Instant;
import java.util.List;

public final class ActionDtos {
    private ActionDtos() {
    }

    public record AiActionView(
            String id,
            String intent,
            @Valid ActionEntities entities,
            String actorId,
            ActionStatus status,
            String confirmedBy
    ) {
    }

    @JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.PROPERTY, property = "type")
    @JsonSubTypes({
            @JsonSubTypes.Type(value = SendEmailEntities.class, name = "send_email"),
            @JsonSubTypes.Type(value = CreateCalendarEventEntities.class, name = "create_calendar_event"),
            @JsonSubTypes.Type(value = UpdateDocumentTagsEntities.class, name = "update_document_tags")
    })
    public sealed interface ActionEntities permits
            SendEmailEntities,
            CreateCalendarEventEntities,
            UpdateDocumentTagsEntities {
    }

    public record SendEmailEntities(
            @NotBlank @Email String to,
            @NotBlank String subject,
            @NotBlank String body
    ) implements ActionEntities {
    }

    public record CreateCalendarEventEntities(
            @NotBlank String title,
            @NotEmpty List<@NotBlank @Email String> attendees,
            @NotBlank String startIso,
            @NotBlank String endIso
    ) implements ActionEntities {
        @AssertTrue(message = "endIso должен быть позже startIso, оба значения должны быть в ISO-8601 формате")
        public boolean hasValidIsoRange() {
            try {
                return Instant.parse(endIso).isAfter(Instant.parse(startIso));
            } catch (Exception ignored) {
                return false;
            }
        }
    }

    public record UpdateDocumentTagsEntities(
            @NotBlank String documentId,
            @NotEmpty List<@NotBlank String> tags
    ) implements ActionEntities {
    }
}
