package com.dmis.backend.integrations.api;

import com.dmis.backend.integrations.application.IntegrationService;
import com.dmis.backend.integrations.application.dto.IntegrationDtos;
import com.dmis.backend.platform.security.CurrentUserProvider;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.UNPROCESSABLE_ENTITY;

@RestController
@RequestMapping("/api")
public class IntegrationsController {
    private final IntegrationService integrationService;
    private final CurrentUserProvider currentUserProvider;

    public IntegrationsController(IntegrationService integrationService, CurrentUserProvider currentUserProvider) {
        this.integrationService = integrationService;
        this.currentUserProvider = currentUserProvider;
    }

    @GetMapping("/calendar/events")
    public List<IntegrationDtos.CalendarEventView> listCalendarEvents(
            @RequestParam(value = "from", required = false) String from,
            @RequestParam(value = "to", required = false) String to
    ) {
        boolean hasFrom = from != null && !from.isBlank();
        boolean hasTo = to != null && !to.isBlank();
        if (hasFrom != hasTo) {
            throw new ResponseStatusException(BAD_REQUEST, "Параметры from и to должны передаваться вместе");
        }
        return integrationService.listCalendarEvents(
                currentUserProvider.currentUser(),
                hasFrom ? Optional.of(from.trim()) : Optional.empty(),
                hasTo ? Optional.of(to.trim()) : Optional.empty()
        );
    }

    @PostMapping("/calendar/events")
    public IntegrationDtos.CalendarEventView createCalendarEvent(@Valid @RequestBody CalendarEventUpsertRequest request) {
        validateDateRange(request.startIso(), request.endIso());
        return integrationService.createCalendarEventUi(
                currentUserProvider.currentUser(),
                request.title(),
                request.attendees(),
                request.startIso(),
                request.endIso(),
                request.description()
        );
    }

    @PostMapping("/calendar/events/from-mail")
    public IntegrationDtos.CalendarEventView createCalendarEventFromMail(@Valid @RequestBody IntegrationDtos.CreateCalendarEventFromMailRequest request) {
        return integrationService.createCalendarEventFromMail(
                currentUserProvider.currentUser(),
                request.mailbox(),
                request.messageId()
        );
    }

    @GetMapping("/calendar/events/{id}")
    public IntegrationDtos.CalendarEventView getCalendarEvent(@PathVariable("id") @NotBlank String id) {
        return integrationService.getCalendarEvent(currentUserProvider.currentUser(), id);
    }

    @PutMapping("/calendar/events/{id}")
    public IntegrationDtos.CalendarEventView updateCalendarEvent(
            @PathVariable("id") @NotBlank String id,
            @Valid @RequestBody CalendarEventUpsertRequest request
    ) {
        validateDateRange(request.startIso(), request.endIso());
        return integrationService.updateCalendarEvent(
                currentUserProvider.currentUser(),
                id,
                request.title(),
                request.attendees(),
                request.startIso(),
                request.endIso(),
                request.description()
        );
    }

    @DeleteMapping("/calendar/events/{id}")
    public ResponseEntity<Void> deleteCalendarEvent(@PathVariable("id") @NotBlank String id) {
        integrationService.deleteCalendarEvent(currentUserProvider.currentUser(), id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/calendar/events/{id}/participants")
    public IntegrationDtos.CalendarEventView addParticipant(
            @PathVariable("id") @NotBlank String eventId,
            @Valid @RequestBody IntegrationDtos.AddCalendarParticipantRequest request
    ) {
        return integrationService.addCalendarParticipant(
                currentUserProvider.currentUser(),
                eventId,
                request.userId()
        );
    }

    @DeleteMapping("/calendar/events/{id}/participants/{userId}")
    public IntegrationDtos.CalendarEventView removeParticipant(
            @PathVariable("id") @NotBlank String eventId,
            @PathVariable("userId") @NotBlank String userId
    ) {
        return integrationService.removeCalendarParticipant(currentUserProvider.currentUser(), eventId, userId);
    }

    @PostMapping("/calendar/events/{id}/attachments")
    public IntegrationDtos.CalendarEventView addAttachment(
            @PathVariable("id") @NotBlank String eventId,
            @Valid @RequestBody IntegrationDtos.AddCalendarAttachmentRequest request
    ) {
        return integrationService.addCalendarAttachment(
                currentUserProvider.currentUser(),
                eventId,
                request.documentId(),
                request.role()
        );
    }

    @DeleteMapping("/calendar/events/{id}/attachments/{attachmentId}")
    public IntegrationDtos.CalendarEventView removeAttachment(
            @PathVariable("id") @NotBlank String eventId,
            @PathVariable("attachmentId") @NotBlank String attachmentId
    ) {
        return integrationService.removeCalendarAttachment(currentUserProvider.currentUser(), eventId, attachmentId);
    }

    @PostMapping("/calendar/availability")
    public IntegrationDtos.AvailabilityResponse availability(@Valid @RequestBody IntegrationDtos.AvailabilityRequest request) {
        return integrationService.calendarAvailability(currentUserProvider.currentUser(), request);
    }

    @PostMapping("/calendar/events/{id}/agenda")
    public IntegrationDtos.CalendarEventView generateAgenda(
            @PathVariable("id") @NotBlank String eventId,
            @RequestBody(required = false) AgendaRequest body
    ) {
        List<String> extra = body != null && body.extraDocumentIds() != null ? body.extraDocumentIds() : List.of();
        return integrationService.prepareMeetingAgendaDraft(currentUserProvider.currentUser(), eventId, extra);
    }

    public record AgendaRequest(List<String> extraDocumentIds) {
    }

    @GetMapping("/calendar/free-busy")
    public IntegrationDtos.FreeBusyView freeBusy(
            @RequestParam("attendee") String attendee,
            @RequestParam(value = "start", required = false, defaultValue = "") String start,
            @RequestParam(value = "end", required = false, defaultValue = "") String end
    ) {
        validateDateRange(start, end);
        return integrationService.freeBusy(currentUserProvider.currentUser(), attendee, start, end);
    }

    @PostMapping("/stt/transcripts")
    public ResponseEntity<TranscriptResponse> transcript(@Valid @RequestBody TranscriptRequest request) {
        String text = integrationService.acceptTranscript(currentUserProvider.currentUser(), request.text());
        return ResponseEntity.ok(new TranscriptResponse(text, "accepted"));
    }

    @PostMapping("/stt/audio")
    public ResponseEntity<TranscriptResponse> transcribeAudio(
            @RequestParam("audio") MultipartFile audio,
            @RequestParam(value = "language", defaultValue = "ru") String language,
            @RequestParam(value = "profile", defaultValue = "fast") String profile
    ) throws IOException {
        try (var audioStream = audio.getInputStream()) {
            String text = integrationService.transcribeAudio(
                    currentUserProvider.currentUser(),
                    audioStream,
                    audio.getSize(),
                    language,
                    profile
            );
            return ResponseEntity.ok(new TranscriptResponse(text, "transcribed"));
        }
    }

    public record CalendarDraftRequest(
            @NotBlank String title,
            @NotEmpty List<String> attendees,
            @NotBlank String startIso,
            @NotBlank String endIso
    ) {
    }

    public record CalendarEventUpsertRequest(
            @NotBlank String title,
            @NotEmpty List<String> attendees,
            @NotBlank String startIso,
            @NotBlank String endIso,
            String description
    ) {
    }

    public record TranscriptRequest(@NotBlank String text) {
    }

    public record TranscriptResponse(String text, String status) {
    }

    @PostMapping("/calendar/drafts")
    public IntegrationDtos.CalendarDraftView validatedCalendarDraft(@Valid @RequestBody CalendarDraftRequest request) {
        validateDateRange(request.startIso(), request.endIso());
        return integrationService.createCalendarDraft(
                currentUserProvider.currentUser(),
                request.title(),
                request.attendees(),
                request.startIso(),
                request.endIso()
        );
    }

    private static void validateDateRange(String startIso, String endIso) {
        if (startIso == null || startIso.isBlank() || endIso == null || endIso.isBlank()) {
            return;
        }
        try {
            Instant start = Instant.parse(startIso);
            Instant end = Instant.parse(endIso);
            if (!end.isAfter(start)) {
                throw new ResponseStatusException(UNPROCESSABLE_ENTITY, "endIso must be after startIso");
            }
        } catch (ResponseStatusException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new ResponseStatusException(UNPROCESSABLE_ENTITY, "Invalid ISO datetime format");
        }
    }
}
