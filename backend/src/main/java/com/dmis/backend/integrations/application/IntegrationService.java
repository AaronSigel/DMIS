package com.dmis.backend.integrations.application;

import com.dmis.backend.audit.application.AuditService;
import com.dmis.backend.integrations.application.dto.IntegrationDtos;
import com.dmis.backend.integrations.application.port.MailCalendarPort;
import com.dmis.backend.integrations.application.port.SttPort;
import com.dmis.backend.shared.model.UserView;
import org.springframework.stereotype.Service;

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
