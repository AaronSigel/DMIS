package com.dmis.backend.integrations.application;

import com.dmis.backend.audit.application.AuditService;
import com.dmis.backend.integrations.application.dto.IntegrationDtos;
import com.dmis.backend.integrations.application.port.CalendarEventPort;
import com.dmis.backend.integrations.application.port.MailCalendarPort;
import com.dmis.backend.integrations.application.port.MailReadPort;
import com.dmis.backend.integrations.application.port.SttPort;
import com.dmis.backend.integrations.domain.model.CalendarEvent;
import com.dmis.backend.platform.error.ApiException;
import com.dmis.backend.shared.model.UserView;
import com.dmis.backend.shared.security.AclService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.InputStream;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class IntegrationService {
    private final MailCalendarPort mailCalendarPort;
    private final MailReadPort mailReadPort;
    private final CalendarEventPort calendarEventPort;
    private final SttPort sttPort;
    private final AuditService auditService;
    private final AclService aclService;

    public IntegrationService(
            MailCalendarPort mailCalendarPort,
            MailReadPort mailReadPort,
            CalendarEventPort calendarEventPort,
            SttPort sttPort,
            AuditService auditService,
            AclService aclService
    ) {
        this.mailCalendarPort = mailCalendarPort;
        this.mailReadPort = mailReadPort;
        this.calendarEventPort = calendarEventPort;
        this.sttPort = sttPort;
        this.auditService = auditService;
        this.aclService = aclService;
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

    public IntegrationDtos.MailDraftView sendMail(
            UserView actor,
            String to,
            String subject,
            String body,
            String idempotencyKey,
            List<IntegrationDtos.MailAttachment> attachments
    ) {
        IntegrationDtos.MailDraftView draft = createMailDraft(actor, to, subject, body);
        List<IntegrationDtos.MailAttachment> safeAttachments = attachments == null ? List.of() : attachments;
        try {
            IntegrationDtos.MailDraftView sent = mailCalendarPort.sendMailDraft(draft, idempotencyKey, safeAttachments);
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

    public IntegrationDtos.CalendarDraftView sendCalendarEvent(
            UserView actor,
            String title,
            List<String> attendees,
            String startIso,
            String endIso,
            String idempotencyKey
    ) {
        IntegrationDtos.CalendarDraftView draft = createCalendarDraft(actor, title, attendees, startIso, endIso);
        try {
            IntegrationDtos.CalendarDraftView sent = mailCalendarPort.sendCalendarDraft(draft, idempotencyKey);
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

    public List<IntegrationDtos.CalendarEventView> listCalendarEvents(UserView actor) {
        List<CalendarEvent> events = aclService.isAdmin(actor)
                ? calendarEventPort.listAllOrderByStartIsoAsc()
                : calendarEventPort.listByCreatedBy(actor.id());
        auditService.append(actor.id(), "calendar.event.list", "event", actor.id(), "Calendar events listed");
        return events.stream().map(this::toCalendarEventView).toList();
    }

    public IntegrationDtos.CalendarEventView getCalendarEvent(UserView actor, String id) {
        CalendarEvent event = requireAccessibleCalendarEvent(actor, id);
        auditService.append(actor.id(), "calendar.event.get", "event", id, "Calendar event read");
        return toCalendarEventView(event);
    }

    public IntegrationDtos.CalendarEventView createCalendarEvent(
            UserView actor,
            String title,
            List<String> attendees,
            String startIso,
            String endIso
    ) {
        Instant now = Instant.now();
        String id = "cal-" + UUID.randomUUID();
        List<String> safeAttendees = attendees == null ? List.of() : attendees;
        CalendarEvent saved = calendarEventPort.save(new CalendarEvent(
                id, title, safeAttendees, startIso, endIso, actor.id(), now, now
        ));
        auditService.append(actor.id(), "calendar.event.create", "event", saved.id(), "Calendar event created");
        return toCalendarEventView(saved);
    }

    public IntegrationDtos.CalendarEventView updateCalendarEvent(
            UserView actor,
            String id,
            String title,
            List<String> attendees,
            String startIso,
            String endIso
    ) {
        CalendarEvent existing = requireAccessibleCalendarEvent(actor, id);
        List<String> safeAttendees = attendees == null ? List.of() : attendees;
        CalendarEvent updated = calendarEventPort.save(new CalendarEvent(
                existing.id(),
                title,
                safeAttendees,
                startIso,
                endIso,
                existing.createdBy(),
                existing.createdAt(),
                Instant.now()
        ));
        auditService.append(actor.id(), "calendar.event.update", "event", id, "Calendar event updated");
        return toCalendarEventView(updated);
    }

    public void deleteCalendarEvent(UserView actor, String id) {
        requireAccessibleCalendarEvent(actor, id);
        calendarEventPort.deleteById(id);
        auditService.append(actor.id(), "calendar.event.delete", "event", id, "Calendar event deleted");
    }

    public List<IntegrationDtos.MailMessageSummaryView> listMailMessages(UserView actor, String mailbox) {
        assertMailboxAccess(actor, mailbox);
        try {
            List<IntegrationDtos.MailMessageSummaryView> messages = mailReadPort.listMailMessages(mailbox);
            auditService.append(actor.id(), "mail.messages.list", "email", mailbox, "Mail messages listed");
            return messages;
        } catch (ApiException ex) {
            auditService.append(actor.id(), "mail.messages.list.failed", "email", mailbox,
                    "Mail messages list failed: " + ex.errorCode());
            throw ex;
        } catch (ResponseStatusException ex) {
            auditService.append(actor.id(), "mail.messages.list.failed", "email", mailbox,
                    "Mail messages list failed: " + ex.getReason());
            throw ex;
        } catch (Exception ex) {
            auditService.append(actor.id(), "mail.messages.list.failed", "email", mailbox,
                    "Mail messages list failed: " + ex.getMessage());
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Mail messages list failed", ex);
        }
    }

    public IntegrationDtos.MailMessageDetailView getMailMessage(UserView actor, String mailbox, String messageId) {
        assertMailboxAccess(actor, mailbox);
        try {
            IntegrationDtos.MailMessageDetailView message = mailReadPort.getMailMessage(mailbox, messageId);
            auditService.append(actor.id(), "mail.message.read", "email", messageId, "Mail message read");
            return message;
        } catch (ApiException ex) {
            auditService.append(actor.id(), "mail.message.read.failed", "email", messageId,
                    "Mail message read failed: " + ex.errorCode());
            throw ex;
        } catch (ResponseStatusException ex) {
            auditService.append(actor.id(), "mail.message.read.failed", "email", messageId,
                    "Mail message read failed: " + ex.getReason());
            throw ex;
        } catch (Exception ex) {
            auditService.append(actor.id(), "mail.message.read.failed", "email", messageId,
                    "Mail message read failed: " + ex.getMessage());
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Mail message read failed", ex);
        }
    }

    public IntegrationDtos.MailMessageSearchView searchMailMessages(
            UserView actor,
            String mailbox,
            IntegrationDtos.MailMessageSearchRequest request
    ) {
        assertMailboxAccess(actor, mailbox);
        try {
            IntegrationDtos.MailMessageSearchView result = mailReadPort.searchMailMessages(mailbox, request);
            auditService.append(actor.id(), "mail.messages.search", "email", mailbox, "Mail messages searched");
            return result;
        } catch (ApiException ex) {
            auditService.append(actor.id(), "mail.messages.search.failed", "email", mailbox,
                    "Mail messages search failed: " + ex.errorCode());
            throw ex;
        } catch (ResponseStatusException ex) {
            auditService.append(actor.id(), "mail.messages.search.failed", "email", mailbox,
                    "Mail messages search failed: " + ex.getReason());
            throw ex;
        } catch (Exception ex) {
            auditService.append(actor.id(), "mail.messages.search.failed", "email", mailbox,
                    "Mail messages search failed: " + ex.getMessage());
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Mail messages search failed", ex);
        }
    }

    public IntegrationDtos.MailAccountView getMailAccount(UserView actor) {
        IntegrationDtos.MailAccountView view =
                new IntegrationDtos.MailAccountView(true, "managed-by-mailpit", 0, actor.email());
        auditService.append(actor.id(), "mail.account.read", "mail_account", actor.id(), "Mail account read");
        return view;
    }

    public IntegrationDtos.MailAccountView upsertMailAccount(
            UserView actor,
            String imapUsername,
            String password,
            String imapHost,
            Integer imapPort
    ) {
        auditService.append(actor.id(), "mail.account.update", "mail_account", actor.id(),
                "Mail account settings are managed by Mailpit");
        return new IntegrationDtos.MailAccountView(true, "managed-by-mailpit", 0, actor.email());
    }

    public void deleteMailAccount(UserView actor) {
        auditService.append(actor.id(), "mail.account.delete", "mail_account", actor.id(),
                "Mail account delete skipped: managed by Mailpit");
    }

    public String acceptTranscript(UserView actor, String text) {
        auditService.append(actor.id(), "stt.transcript.accepted", "ai_action", "n/a", "Transcript accepted");
        return text;
    }

    public String transcribeAudio(UserView actor, InputStream audioStream, long audioSizeBytes, String language, String profile) {
        String text = sttPort.transcribe(audioStream, audioSizeBytes, language, profile);
        auditService.append(actor.id(), "stt.audio.transcribed", "ai_action", "n/a",
                "Audio transcribed: " + audioSizeBytes + " bytes, profile=" + profile);
        return text;
    }

    private void assertMailboxAccess(UserView actor, String mailbox) {
        if (aclService.isAdmin(actor)) {
            return;
        }
        if (!mailbox.equalsIgnoreCase(actor.email())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No read access to mailbox");
        }
    }

    private CalendarEvent requireAccessibleCalendarEvent(UserView actor, String id) {
        Optional<CalendarEvent> opt = calendarEventPort.findById(id);
        if (opt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Calendar event not found");
        }
        CalendarEvent event = opt.get();
        if (!aclService.isAdmin(actor) && !event.createdBy().equals(actor.id())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Calendar event not found");
        }
        return event;
    }

    private IntegrationDtos.CalendarEventView toCalendarEventView(CalendarEvent e) {
        return new IntegrationDtos.CalendarEventView(
                e.id(),
                e.title(),
                List.copyOf(e.attendees()),
                e.startIso(),
                e.endIso(),
                e.createdBy(),
                e.createdAt(),
                e.updatedAt()
        );
    }
}
