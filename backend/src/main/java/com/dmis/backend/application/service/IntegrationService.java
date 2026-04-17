package com.dmis.backend.integrations.application;

import com.dmis.backend.audit.application.AuditService;
import com.dmis.backend.integrations.application.dto.IntegrationDtos;
import com.dmis.backend.integrations.application.port.MailCalendarPort;
import com.dmis.backend.shared.model.UserView;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class IntegrationService {
    private final MailCalendarPort mailCalendarPort;
    private final AuditService auditService;

    public IntegrationService(MailCalendarPort mailCalendarPort, AuditService auditService) {
        this.mailCalendarPort = mailCalendarPort;
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

    public IntegrationDtos.FreeBusyView freeBusy(UserView actor, String attendee) {
        auditService.append(actor.id(), "calendar.free_busy.read", "event", attendee, "Free/busy requested");
        return new IntegrationDtos.FreeBusyView(attendee, List.of(
                new IntegrationDtos.BusySlot("2026-04-17T09:00:00Z", "2026-04-17T10:00:00Z"),
                new IntegrationDtos.BusySlot("2026-04-17T14:00:00Z", "2026-04-17T14:30:00Z")
        ));
    }

    public String acceptTranscript(UserView actor, String text) {
        auditService.append(actor.id(), "stt.transcript.accepted", "ai_action", "n/a", "Transcript accepted");
        return text;
    }
}
