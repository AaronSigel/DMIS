package com.dmis.backend.integrations.api;

import com.dmis.backend.integrations.application.IntegrationService;
import com.dmis.backend.integrations.application.dto.IntegrationDtos;
import com.dmis.backend.platform.security.CurrentUserProvider;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    @PostMapping("/calendar/drafts")
    public IntegrationDtos.CalendarDraftView calendarDraft(@Valid @RequestBody CalendarDraftRequest request) {
        return integrationService.createCalendarDraft(
                currentUserProvider.currentUser(),
                request.title(),
                request.attendees(),
                request.startIso(),
                request.endIso()
        );
    }

    @GetMapping("/calendar/free-busy")
    public IntegrationDtos.FreeBusyView freeBusy(@RequestParam String attendee) {
        return integrationService.freeBusy(currentUserProvider.currentUser(), attendee);
    }

    @PostMapping("/stt/transcripts")
    public ResponseEntity<TranscriptResponse> transcript(@Valid @RequestBody TranscriptRequest request) {
        String text = integrationService.acceptTranscript(currentUserProvider.currentUser(), request.text());
        return ResponseEntity.ok(new TranscriptResponse(text, "accepted"));
    }

    public record MailDraftRequest(@NotBlank String to, @NotBlank String subject, @NotBlank String body) {
    }

    public record CalendarDraftRequest(
            @NotBlank String title,
            @NotEmpty List<String> attendees,
            @NotBlank String startIso,
            @NotBlank String endIso
    ) {
    }

    public record TranscriptRequest(@NotBlank String text) {
    }

    public record TranscriptResponse(String text, String status) {
    }
}
