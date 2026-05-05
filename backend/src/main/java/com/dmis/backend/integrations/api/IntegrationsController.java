package com.dmis.backend.integrations.api;

import com.dmis.backend.integrations.application.IntegrationService;
import com.dmis.backend.integrations.application.dto.IntegrationDtos;
import com.dmis.backend.platform.security.CurrentUserProvider;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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
            @RequestParam(value = "language", defaultValue = "ru") String language
    ) throws IOException {
        String text = integrationService.transcribeAudio(currentUserProvider.currentUser(), audio.getBytes(), language);
        return ResponseEntity.ok(new TranscriptResponse(text, "transcribed"));
    }

    public record MailDraftRequest(@NotBlank @Email String to, @NotBlank String subject, @NotBlank String body) {
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
