package com.dmis.backend.integrations.application;

import com.dmis.backend.audit.application.AuditService;
import com.dmis.backend.integrations.application.dto.IntegrationDtos;
import com.dmis.backend.integrations.application.port.MailCalendarPort;
import com.dmis.backend.integrations.application.port.SttPort;
import com.dmis.backend.shared.model.UserView;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class IntegrationService {
    private final MailCalendarPort mailCalendarPort;
    private final SttPort sttPort;
    private final AuditService auditService;

    public IntegrationService(MailCalendarPort mailCalendarPort, SttPort sttPort, AuditService auditService) {
        this.mailCalendarPort = mailCalendarPort;
        this.sttPort = sttPort;
        this.auditService = auditService;
    }

    public IntegrationDtos.MailDraftView createMailDraft(UserView actor, String to, String subject, String body) {
        IntegrationDtos.MailDraftView draft = mailCalendarPort.saveMailDraft(
                new IntegrationDtos.MailDraftView("mail-" + UUID.randomUUID(), to, subject, body, actor.id())
        );
        auditService.append(actor.id(), "mail.draft.create", "email", draft.id(), "Mail draft prepared");
        return draft;
    }

    public IntegrationDtos.CalendarDraftView createCalendarDraft(UserView actor, String title, List<String> attendees, String startIso, String endIso) {
        IntegrationDtos.CalendarDraftView draft = mailCalendarPort.saveCalendarDraft(
                new IntegrationDtos.CalendarDraftView("event-" + UUID.randomUUID(), title, attendees, startIso, endIso, actor.id())
        );
        auditService.append(actor.id(), "calendar.draft.create", "event", draft.id(), "Calendar draft prepared");
        return draft;
    }

    public IntegrationDtos.MailDraftView sendMail(UserView actor, String to, String subject, String body) {
        IntegrationDtos.MailDraftView draft = createMailDraft(actor, to, subject, body);
        try {
            IntegrationDtos.MailDraftView sent = mailCalendarPort.sendMailDraft(draft);
            auditService.append(actor.id(), "mail.send", "email", sent.id(), "Mail sent successfully");
            return sent;
        } catch (ResponseStatusException ex) {
            auditService.append(actor.id(), "mail.send.failed", "email", draft.id(),
                    "Mail sending failed: " + ex.getReason());
            throw ex;
        } catch (Exception ex) {
            auditService.append(actor.id(), "mail.send.failed", "email", draft.id(),
                    "Mail sending failed: " + ex.getMessage());
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Mail sending failed", ex);
        }
    }

    public IntegrationDtos.CalendarDraftView sendCalendarEvent(UserView actor, String title, List<String> attendees, String startIso, String endIso) {
        IntegrationDtos.CalendarDraftView draft = createCalendarDraft(actor, title, attendees, startIso, endIso);
        try {
            IntegrationDtos.CalendarDraftView sent = mailCalendarPort.sendCalendarDraft(draft);
            auditService.append(actor.id(), "calendar.send", "event", sent.id(), "Calendar event sent successfully");
            return sent;
        } catch (ResponseStatusException ex) {
            auditService.append(actor.id(), "calendar.send.failed", "event", draft.id(),
                    "Calendar event sending failed: " + ex.getReason());
            throw ex;
        } catch (Exception ex) {
            auditService.append(actor.id(), "calendar.send.failed", "event", draft.id(),
                    "Calendar event sending failed: " + ex.getMessage());
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Calendar event sending failed", ex);
        }
    }

    public IntegrationDtos.FreeBusyView freeBusy(UserView actor, String attendee, String startIso, String endIso) {
        auditService.append(actor.id(), "calendar.free_busy.read", "event", attendee, "Free/busy requested");
        return mailCalendarPort.getFreeBusy(attendee, startIso, endIso);
    }

    public String acceptTranscript(UserView actor, String text) {
        auditService.append(actor.id(), "stt.transcript.accepted", "ai_action", "n/a", "Transcript accepted");
        return text;
    }

    public String transcribeAudio(UserView actor, byte[] audioBytes, String language) {
        String text = sttPort.transcribe(audioBytes, language);
        auditService.append(actor.id(), "stt.audio.transcribed", "ai_action", "n/a",
                "Audio transcribed: " + audioBytes.length + " bytes");
        return text;
    }
}
