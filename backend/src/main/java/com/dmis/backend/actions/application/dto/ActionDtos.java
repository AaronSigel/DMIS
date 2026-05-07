package com.dmis.backend.actions.application.dto;

import com.dmis.backend.actions.domain.ActionStatus;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import jakarta.validation.Valid;
import jakarta.validation.constraints.AssertTrue;
import com.dmis.backend.actions.application.validation.EmailOrUserMention;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.List;
import java.util.Set;

public final class ActionDtos {
    public static final String SEND_EMAIL_INTENT = "send_email";
    public static final String CREATE_CALENDAR_EVENT_INTENT = "create_calendar_event";
    public static final String UPDATE_DOCUMENT_TAGS_INTENT = "update_document_tags";
    private static final Set<String> SUPPORTED_INTENTS = Set.of(
            SEND_EMAIL_INTENT,
            CREATE_CALENDAR_EVENT_INTENT,
            UPDATE_DOCUMENT_TAGS_INTENT
    );

    private ActionDtos() {
    }

    public static Set<String> supportedIntents() {
        return SUPPORTED_INTENTS;
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
            @JsonSubTypes.Type(value = SendEmailEntities.class, name = SEND_EMAIL_INTENT),
            @JsonSubTypes.Type(value = CreateCalendarEventEntities.class, name = CREATE_CALENDAR_EVENT_INTENT),
            @JsonSubTypes.Type(value = UpdateDocumentTagsEntities.class, name = UPDATE_DOCUMENT_TAGS_INTENT)
    })
    public sealed interface ActionEntities permits
            SendEmailEntities,
            CreateCalendarEventEntities,
            UpdateDocumentTagsEntities {
    }

    public record SendEmailEntities(
            @NotBlank @EmailOrUserMention String to,
            @NotBlank String subject,
            @NotBlank String body,
            @Size(max = 10) List<@NotBlank String> attachmentDocumentIds
    ) implements ActionEntities {

        public SendEmailEntities(String to, String subject, String body) {
            this(to, subject, body, List.of());
        }

        public SendEmailEntities {
            attachmentDocumentIds = attachmentDocumentIds == null ? List.of() : List.copyOf(attachmentDocumentIds);
        }
    }

    public record CreateCalendarEventEntities(
            @NotBlank String title,
            @NotEmpty List<@NotBlank @EmailOrUserMention String> attendees,
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
