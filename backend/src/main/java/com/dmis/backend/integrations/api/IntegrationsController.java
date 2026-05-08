package com.dmis.backend.integrations.api;

import com.dmis.backend.integrations.application.IntegrationService;
import com.dmis.backend.integrations.application.dto.IntegrationDtos;
import com.dmis.backend.platform.security.CurrentUserProvider;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
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

    @PostMapping("/mail/drafts")
    public IntegrationDtos.MailDraftView mailDraft(@Valid @RequestBody MailDraftRequest request) {
        return integrationService.createMailDraft(currentUserProvider.currentUser(), request.to(), request.subject(), request.body());
    }

    @GetMapping("/mail/account")
    public IntegrationDtos.MailAccountView getMailAccount() {
        return integrationService.getMailAccount(currentUserProvider.currentUser());
    }

    @PutMapping("/mail/account")
    public IntegrationDtos.MailAccountView upsertMailAccount(@Valid @RequestBody MailAccountUpsertRequest request) {
        return integrationService.upsertMailAccount(
                currentUserProvider.currentUser(),
                request.imapUsername(),
                request.password(),
                request.imapHost(),
                request.imapPort()
        );
    }

    @DeleteMapping("/mail/account")
    public ResponseEntity<Void> deleteMailAccount() {
        integrationService.deleteMailAccount(currentUserProvider.currentUser());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/mail/messages")
    public List<IntegrationDtos.MailMessageSummaryView> listMailMessages(
            @RequestParam(value = "mailbox", required = false, defaultValue = "") String mailbox
    ) {
        return integrationService.listMailMessages(currentUserProvider.currentUser(), resolveMailbox(mailbox));
    }

    @GetMapping("/mail/messages/{id}")
    public IntegrationDtos.MailMessageDetailView getMailMessage(
            @PathVariable("id") @NotBlank String id,
            @RequestParam(value = "mailbox", required = false, defaultValue = "") String mailbox
    ) {
        return integrationService.getMailMessage(currentUserProvider.currentUser(), resolveMailbox(mailbox), id);
    }

    @PostMapping("/mail/messages/search")
    public IntegrationDtos.MailMessageSearchView searchMailMessages(
            @Valid @RequestBody MailSearchRequest request
    ) {
        IntegrationDtos.MailMessageSearchRequest searchRequest =
                new IntegrationDtos.MailMessageSearchRequest(request.query(), request.limit());
        return integrationService.searchMailMessages(
                currentUserProvider.currentUser(),
                resolveMailbox(request.mailbox()),
                searchRequest
        );
    }

    @GetMapping("/calendar/events")
    public List<IntegrationDtos.CalendarEventView> listCalendarEvents() {
        return integrationService.listCalendarEvents(currentUserProvider.currentUser());
    }

    @PostMapping("/calendar/events")
    public IntegrationDtos.CalendarEventView createCalendarEvent(@Valid @RequestBody CalendarEventUpsertRequest request) {
        validateDateRange(request.startIso(), request.endIso());
        return integrationService.createCalendarEvent(
                currentUserProvider.currentUser(),
                request.title(),
                request.attendees(),
                request.startIso(),
                request.endIso()
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
                request.endIso()
        );
    }

    @DeleteMapping("/calendar/events/{id}")
    public ResponseEntity<Void> deleteCalendarEvent(@PathVariable("id") @NotBlank String id) {
        integrationService.deleteCalendarEvent(currentUserProvider.currentUser(), id);
        return ResponseEntity.noContent().build();
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

    public record MailDraftRequest(@NotBlank @Email String to, @NotBlank String subject, @NotBlank String body) {
    }

    public record MailAccountUpsertRequest(
            String imapHost,
            Integer imapPort,
            String imapUsername,
            String password
    ) {
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
            @NotBlank String endIso
    ) {
    }

    public record TranscriptRequest(@NotBlank String text) {
    }

    public record MailSearchRequest(
            @NotBlank String query,
            String mailbox,
            int limit
    ) {
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

    private String resolveMailbox(String mailbox) {
        if (mailbox == null || mailbox.isBlank()) {
            return currentUserProvider.currentUser().email();
        }
        return mailbox;
    }
}
