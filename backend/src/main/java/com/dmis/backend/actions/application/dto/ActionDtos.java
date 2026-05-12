package com.dmis.backend.actions.application.dto;

import com.dmis.backend.actions.domain.ActionStatus;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import jakarta.validation.Valid;
import jakarta.validation.constraints.AssertTrue;
import com.dmis.backend.actions.application.validation.EmailOrUserMention;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.List;
import java.util.Set;

public final class ActionDtos {
    public static final String SEND_EMAIL_INTENT = "send_email";
    public static final String CREATE_CALENDAR_EVENT_INTENT = "create_calendar_event";
    public static final String UPDATE_DOCUMENT_TAGS_INTENT = "update_document_tags";
    public static final String RESCHEDULE_CALENDAR_EVENT_INTENT = "reschedule_calendar_event";
    public static final String PREPARE_MEETING_AGENDA_INTENT = "prepare_meeting_agenda";
    public static final String SUGGEST_MEETING_SLOTS_INTENT = "suggest_meeting_slots";
    private static final Set<String> SUPPORTED_INTENTS = Set.of(
            SEND_EMAIL_INTENT,
            CREATE_CALENDAR_EVENT_INTENT,
            UPDATE_DOCUMENT_TAGS_INTENT,
            RESCHEDULE_CALENDAR_EVENT_INTENT,
            PREPARE_MEETING_AGENDA_INTENT,
            SUGGEST_MEETING_SLOTS_INTENT
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
            @JsonSubTypes.Type(value = UpdateDocumentTagsEntities.class, name = UPDATE_DOCUMENT_TAGS_INTENT),
            @JsonSubTypes.Type(value = RescheduleCalendarEventEntities.class, name = RESCHEDULE_CALENDAR_EVENT_INTENT),
            @JsonSubTypes.Type(value = PrepareMeetingAgendaEntities.class, name = PREPARE_MEETING_AGENDA_INTENT),
            @JsonSubTypes.Type(value = SuggestMeetingSlotsEntities.class, name = SUGGEST_MEETING_SLOTS_INTENT)
    })
    public sealed interface ActionEntities permits
            SendEmailEntities,
            CreateCalendarEventEntities,
            UpdateDocumentTagsEntities,
            RescheduleCalendarEventEntities,
            PrepareMeetingAgendaEntities,
            SuggestMeetingSlotsEntities {
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

    public record RescheduleCalendarEventEntities(
            @NotBlank String eventId,
            String title,
            @NotBlank String startIso,
            @NotBlank String endIso
    ) implements ActionEntities {
        @AssertTrue(message = "endIso должен быть позже startIso")
        public boolean hasValidIsoRange() {
            try {
                return Instant.parse(endIso).isAfter(Instant.parse(startIso));
            } catch (Exception ignored) {
                return false;
            }
        }
    }

    public record PrepareMeetingAgendaEntities(
            @NotBlank String eventId,
            List<@NotBlank String> extraDocumentIds
    ) implements ActionEntities {
        public PrepareMeetingAgendaEntities {
            extraDocumentIds = extraDocumentIds == null ? List.of() : List.copyOf(extraDocumentIds);
        }
    }

    public record SuggestMeetingSlotsEntities(
            @NotEmpty List<@NotBlank @EmailOrUserMention String> attendeeEmails,
            @NotBlank String fromIso,
            @NotBlank String toIso,
            @NotNull Integer slotMinutes
    ) implements ActionEntities {
        @AssertTrue(message = "slotMinutes должен быть в диапазоне 1–1440")
        public boolean slotMinutesValid() {
            return slotMinutes != null && slotMinutes > 0 && slotMinutes <= 24 * 60;
        }

        @AssertTrue(message = "toIso должен быть позже fromIso")
        public boolean hasValidWindow() {
            try {
                return Instant.parse(toIso).isAfter(Instant.parse(fromIso));
            } catch (Exception ignored) {
                return false;
            }
        }
    }
}
