package com.dmis.backend.integrations.application;

import com.dmis.backend.audit.application.AuditService;
import com.dmis.backend.documents.application.DocumentUseCases;
import com.dmis.backend.documents.application.dto.DocumentDtos;
import com.dmis.backend.integrations.application.dto.IntegrationDtos;
import com.dmis.backend.integrations.application.port.CalendarAttachmentPort;
import com.dmis.backend.integrations.application.port.CalendarEventPort;
import com.dmis.backend.integrations.application.port.CalendarParticipantPort;
import com.dmis.backend.integrations.application.port.MailCalendarPort;
import com.dmis.backend.integrations.application.port.MailDraftPort;
import com.dmis.backend.integrations.application.port.MailReadPort;
import com.dmis.backend.integrations.application.port.SttPort;
import com.dmis.backend.integrations.domain.model.CalendarEvent;
import com.dmis.backend.integrations.domain.model.CalendarEventAttachment;
import com.dmis.backend.integrations.domain.model.CalendarEventParticipant;
import com.dmis.backend.integrations.domain.model.EventAttachmentRole;
import com.dmis.backend.integrations.domain.model.EventCreationSource;
import com.dmis.backend.integrations.domain.model.EventParticipantStatus;
import com.dmis.backend.integrations.domain.model.MailFolder;
import com.dmis.backend.search.application.port.LlmChatPort;
import com.dmis.backend.users.application.port.UserAccessPort;
import com.dmis.backend.platform.error.ApiException;
import com.dmis.backend.shared.model.UserView;
import com.dmis.backend.shared.security.AclService;
import jakarta.mail.internet.AddressException;
import jakarta.mail.internet.InternetAddress;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.InputStream;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;
import static org.springframework.http.HttpStatus.UNPROCESSABLE_ENTITY;

@Service
public class IntegrationService {
    private final MailCalendarPort mailCalendarPort;
    private final MailReadPort mailReadPort;
    private final CalendarEventPort calendarEventPort;
    private final SttPort sttPort;
    private final AuditService auditService;
    private final AclService aclService;
    private final MailDraftPort mailDraftPort;
    private final DocumentUseCases documentUseCases;
    private final CalendarParticipantPort calendarParticipantPort;
    private final CalendarAttachmentPort calendarAttachmentPort;
    private final UserAccessPort userAccessPort;
    private final LlmChatPort llmChatPort;
    private final int mailAttachmentsMaxCount;
    private final long mailAttachmentsMaxTotalBytes;
    private final int mailSummaryMaxTokens;

    public IntegrationService(
            MailCalendarPort mailCalendarPort,
            MailReadPort mailReadPort,
            CalendarEventPort calendarEventPort,
            SttPort sttPort,
            AuditService auditService,
            AclService aclService,
            MailDraftPort mailDraftPort,
            DocumentUseCases documentUseCases,
            CalendarParticipantPort calendarParticipantPort,
            CalendarAttachmentPort calendarAttachmentPort,
            UserAccessPort userAccessPort,
            LlmChatPort llmChatPort,
            @Value("${mail.attachments.max-count:10}") int mailAttachmentsMaxCount,
            @Value("${mail.attachments.max-total-bytes:26214400}") long mailAttachmentsMaxTotalBytes,
            @Value("${mail.summary.max-tokens:2048}") int mailSummaryMaxTokens
    ) {
        this.mailCalendarPort = mailCalendarPort;
        this.mailReadPort = mailReadPort;
        this.calendarEventPort = calendarEventPort;
        this.sttPort = sttPort;
        this.auditService = auditService;
        this.aclService = aclService;
        this.mailDraftPort = mailDraftPort;
        this.documentUseCases = documentUseCases;
        this.calendarParticipantPort = calendarParticipantPort;
        this.calendarAttachmentPort = calendarAttachmentPort;
        this.userAccessPort = userAccessPort;
        this.llmChatPort = llmChatPort;
        this.mailAttachmentsMaxCount = mailAttachmentsMaxCount;
        this.mailAttachmentsMaxTotalBytes = mailAttachmentsMaxTotalBytes;
        this.mailSummaryMaxTokens = mailSummaryMaxTokens;
    }

    public IntegrationDtos.MailDraftView createMailDraft(UserView actor, String to, String subject, String body) {
        return createMailDraft(actor, to, subject, body, null);
    }

    public IntegrationDtos.MailDraftView createMailDraft(
            UserView actor,
            String to,
            String subject,
            String body,
            List<String> attachmentDocumentIds
    ) {
        String safeTo = to == null ? "" : to.trim();
        validateMailDraftRecipientIfPresent(safeTo);
        String safeSubject = subject == null ? "" : subject;
        String safeBody = body == null ? "" : body;
        IntegrationDtos.MailDraftView draft = mailCalendarPort.saveMailDraft(
                new IntegrationDtos.MailDraftView("mail-" + UUID.randomUUID(), safeTo, safeSubject, safeBody, actor.id())
        );
        auditService.append(actor.id(), "mail.draft.create", "email", draft.id(), "Mail draft prepared");
        if (attachmentDocumentIds != null && !attachmentDocumentIds.isEmpty()) {
            replaceDraftAttachments(actor, draft.id(), attachmentDocumentIds);
        }
        return draft;
    }

    public IntegrationDtos.CalendarDraftView createCalendarDraft(UserView actor, String title, List<String> attendees, String startIso, String endIso) {
        IntegrationDtos.CalendarDraftView draft = mailCalendarPort.saveCalendarDraft(
                new IntegrationDtos.CalendarDraftView("event-" + UUID.randomUUID(), title, attendees, startIso, endIso, actor.id())
        );
        auditService.append(actor.id(), "calendar.draft.create", "event", draft.id(), "Calendar draft prepared");
        return draft;
    }

    /**
     * Непустой «Кому» должен быть разборимым RFC-5322 адресом (черновик не хранит заведомый мусор).
     */
    private static void validateMailDraftRecipientIfPresent(String to) {
        if (to == null || to.isBlank()) {
            return;
        }
        int at = to.lastIndexOf('@');
        if (at < 1 || at == to.length() - 1) {
            throw new ResponseStatusException(BAD_REQUEST, "Invalid recipient address");
        }
        try {
            InternetAddress addr = new InternetAddress(to);
            addr.validate();
        } catch (AddressException ex) {
            throw new ResponseStatusException(BAD_REQUEST, "Invalid recipient address", ex);
        }
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
            IntegrationDtos.MailDraftView sent = mailCalendarPort.sendMailDraft(draft, idempotencyKey, safeAttachments, actor.email());
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

    public List<IntegrationDtos.CalendarEventView> listCalendarEvents(UserView actor, Optional<String> fromIso, Optional<String> toIso) {
        List<CalendarEvent> events;
        if (fromIso.isPresent() && toIso.isPresent()) {
            String from = fromIso.get();
            String to = toIso.get();
            validateIsoRange(from, to);
            events = aclService.isAdmin(actor)
                    ? calendarEventPort.listAllOverlapping(from, to)
                    : calendarEventPort.listByCreatedByOverlapping(actor.id(), from, to);
        } else {
            events = aclService.isAdmin(actor)
                    ? calendarEventPort.listAllOrderByStartIsoAsc()
                    : calendarEventPort.listByCreatedBy(actor.id());
        }
        auditService.append(actor.id(), "calendar.event.list", "event", actor.id(), "Calendar events listed");
        if (events.isEmpty()) {
            return List.of();
        }

        List<String> eventIds = events.stream().map(CalendarEvent::id).toList();
        List<CalendarEventParticipant> participants = calendarParticipantPort.listByEventIdsOrdered(eventIds);
        Map<String, List<CalendarEventParticipant>> participantsByEvent = participants.stream()
                .collect(Collectors.groupingBy(CalendarEventParticipant::eventId));
        Map<String, UserView> usersById = userAccessPort.findAllByIds(participants.stream()
                        .map(CalendarEventParticipant::userId)
                        .distinct()
                        .toList())
                .stream()
                .collect(Collectors.toMap(UserView::id, Function.identity(), (left, right) -> left));

        List<CalendarEventAttachment> attachments = calendarAttachmentPort.listByEventIdsOrdered(eventIds);
        Map<String, List<CalendarEventAttachment>> attachmentsByEvent = attachments.stream()
                .collect(Collectors.groupingBy(CalendarEventAttachment::eventId));
        Map<String, DocumentDtos.DocumentView> documentsById = documentUseCases.getAccessibleByIds(
                actor,
                attachments.stream()
                        .map(CalendarEventAttachment::documentId)
                        .distinct()
                        .toList()
        );

        return events.stream()
                .map(event -> toCalendarEventView(
                        event,
                        participantsByEvent.getOrDefault(event.id(), List.of()),
                        attachmentsByEvent.getOrDefault(event.id(), List.of()),
                        usersById,
                        documentsById
                ))
                .toList();
    }

    public IntegrationDtos.CalendarEventView getCalendarEvent(UserView actor, String id) {
        CalendarEvent event = requireAccessibleCalendarEvent(actor, id);
        auditService.append(actor.id(), "calendar.event.get", "event", id, "Calendar event read");
        return toCalendarEventView(actor, event);
    }

    public IntegrationDtos.CalendarEventView createCalendarEvent(
            UserView actor,
            String title,
            List<String> attendees,
            String startIso,
            String endIso,
            String description,
            EventCreationSource creationSource,
            String sourceMailMessageId
    ) {
        Instant now = Instant.now();
        String id = "cal-" + UUID.randomUUID();
        List<String> safeAttendees = attendees == null ? List.of() : attendees;
        EventCreationSource src = creationSource != null ? creationSource : EventCreationSource.UI;
        CalendarEvent saved = calendarEventPort.save(new CalendarEvent(
                id,
                title,
                safeAttendees,
                startIso,
                endIso,
                actor.id(),
                now,
                now,
                description == null ? "" : description,
                src,
                sourceMailMessageId
        ));
        auditService.append(actor.id(), "calendar.event.create", "event", saved.id(), "Calendar event created");
        return toCalendarEventView(actor, saved);
    }

    /** Создание события из UI (без указания источника в контроллере). */
    public IntegrationDtos.CalendarEventView createCalendarEventUi(
            UserView actor,
            String title,
            List<String> attendees,
            String startIso,
            String endIso,
            String description
    ) {
        return createCalendarEvent(actor, title, attendees, startIso, endIso, description, EventCreationSource.UI, null);
    }

    public IntegrationDtos.CalendarEventView updateCalendarEvent(
            UserView actor,
            String id,
            String title,
            List<String> attendees,
            String startIso,
            String endIso,
            String description
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
                Instant.now(),
                description == null ? existing.description() : description,
                existing.creationSource(),
                existing.sourceMailMessageId()
        ));
        auditService.append(actor.id(), "calendar.event.update", "event", id, "Calendar event updated");
        return toCalendarEventView(actor, updated);
    }

    public void deleteCalendarEvent(UserView actor, String id) {
        requireAccessibleCalendarEvent(actor, id);
        calendarEventPort.deleteById(id);
        auditService.append(actor.id(), "calendar.event.delete", "event", id, "Calendar event deleted");
    }

    public IntegrationDtos.CalendarEventView createCalendarEventFromMail(UserView actor, String mailbox, String messageId) {
        IntegrationDtos.MailMessageDetailView mail = getMailMessage(actor, mailbox, messageId);
        List<String> attendeeEmails = extractEmailsFromMailParticipants(mail.from(), mail.to());
        String title = mail.subject() == null || mail.subject().isBlank() ? "Встреча" : mail.subject().trim();
        Instant now = Instant.now();
        Instant start = now.plusSeconds(3600);
        Instant end = start.plusSeconds(3600);
        IntegrationDtos.CalendarEventView created = createCalendarEvent(
                actor,
                title,
                attendeeEmails.isEmpty() ? List.of(actor.email()) : attendeeEmails,
                start.toString(),
                end.toString(),
                mail.body() == null ? "" : mail.body().trim(),
                EventCreationSource.MAIL,
                messageId
        );
        auditService.append(actor.id(), "calendar.event.from_mail", "event", created.id(), "Calendar event seeded from mail " + messageId);
        return created;
    }

    public IntegrationDtos.CalendarEventView addCalendarParticipant(UserView actor, String eventId, String userId) {
        requireAccessibleCalendarEvent(actor, eventId);
        UserView user = userAccessPort.findById(userId).orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User not found"));
        if (calendarParticipantPort.findByEventAndUser(eventId, userId).isPresent()) {
            throw new ResponseStatusException(BAD_REQUEST, "Participant already added");
        }
        calendarParticipantPort.save(new CalendarEventParticipant(
                "cep-" + UUID.randomUUID(),
                eventId,
                userId,
                EventParticipantStatus.PENDING,
                Instant.now()
        ));
        mergeAttendeeEmail(eventId, user.email());
        auditService.append(actor.id(), "calendar.participant.add", "event", eventId, "Added participant " + userId);
        return toCalendarEventView(actor, calendarEventPort.findById(eventId).orElseThrow());
    }

    public IntegrationDtos.CalendarEventView removeCalendarParticipant(UserView actor, String eventId, String userId) {
        requireAccessibleCalendarEvent(actor, eventId);
        if (calendarParticipantPort.findByEventAndUser(eventId, userId).isEmpty()) {
            throw new ResponseStatusException(NOT_FOUND, "Participant not found");
        }
        calendarParticipantPort.deleteByEventAndUser(eventId, userId);
        UserView user = userAccessPort.findById(userId).orElse(null);
        if (user != null) {
            removeAttendeeEmail(eventId, user.email());
        }
        auditService.append(actor.id(), "calendar.participant.remove", "event", eventId, "Removed participant " + userId);
        return toCalendarEventView(actor, calendarEventPort.findById(eventId).orElseThrow());
    }

    public IntegrationDtos.CalendarEventView addCalendarAttachment(
            UserView actor,
            String eventId,
            String documentId,
            String roleRaw
    ) {
        EventAttachmentRole role;
        try {
            role = EventAttachmentRole.valueOf(roleRaw.trim().toUpperCase(Locale.ROOT));
        } catch (Exception ex) {
            throw new ResponseStatusException(BAD_REQUEST, "Invalid attachment role");
        }
        requireAccessibleCalendarEvent(actor, eventId);
        documentUseCases.get(actor, documentId);
        for (CalendarEventAttachment a : calendarAttachmentPort.listByEventIdOrdered(eventId)) {
            if (a.documentId().equals(documentId) && a.role().equals(role)) {
                throw new ResponseStatusException(BAD_REQUEST, "Attachment with this role already exists for document");
            }
        }
        calendarAttachmentPort.save(new CalendarEventAttachment(
                "cea-" + UUID.randomUUID(),
                eventId,
                documentId,
                role,
                Instant.now()
        ));
        auditService.append(actor.id(), "calendar.attachment.add", "event", eventId, "Attached document " + documentId + " as " + role);
        return toCalendarEventView(actor, calendarEventPort.findById(eventId).orElseThrow());
    }

    public IntegrationDtos.CalendarEventView removeCalendarAttachment(UserView actor, String eventId, String attachmentId) {
        requireAccessibleCalendarEvent(actor, eventId);
        CalendarEventAttachment row = calendarAttachmentPort.findById(attachmentId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Attachment not found"));
        if (!row.eventId().equals(eventId)) {
            throw new ResponseStatusException(NOT_FOUND, "Attachment not found");
        }
        calendarAttachmentPort.deleteById(attachmentId);
        auditService.append(actor.id(), "calendar.attachment.remove", "event", eventId, "Removed attachment " + attachmentId);
        return toCalendarEventView(actor, calendarEventPort.findById(eventId).orElseThrow());
    }

    public IntegrationDtos.AvailabilityResponse calendarAvailability(UserView actor, IntegrationDtos.AvailabilityRequest request) {
        if (request.slotMinutes() <= 0 || request.slotMinutes() > 24 * 60) {
            throw new ResponseStatusException(BAD_REQUEST, "slotMinutes out of range");
        }
        validateIsoRange(request.fromIso(), request.toIso());
        Instant from = Instant.parse(request.fromIso());
        Instant to = Instant.parse(request.toIso());
        List<String> emails = request.attendeeEmails() == null ? List.of() : request.attendeeEmails();
        List<Instant[]> busyRaw = new ArrayList<>();
        for (String email : emails) {
            if (email == null || email.isBlank()) {
                continue;
            }
            IntegrationDtos.FreeBusyView fb = mailCalendarPort.getFreeBusy(email.trim(), request.fromIso(), request.toIso());
            for (IntegrationDtos.BusySlot slot : fb.busySlots()) {
                try {
                    Instant s = Instant.parse(slot.startIso());
                    Instant e = Instant.parse(slot.endIso());
                    if (e.isAfter(from) && s.isBefore(to)) {
                        busyRaw.add(new Instant[]{
                                s.isBefore(from) ? from : s,
                                e.isAfter(to) ? to : e
                        });
                    }
                } catch (Exception ignored) {
                }
            }
        }
        List<Instant[]> merged = mergeBusyIntervals(busyRaw);
        long slotNanos = request.slotMinutes() * 60L * 1_000_000_000L;
        List<IntegrationDtos.SuggestedSlot> slots = new ArrayList<>();
        Instant cursor = from;
        while (cursor.plusNanos(slotNanos).compareTo(to) <= 0) {
            Instant slotEnd = cursor.plusNanos(slotNanos);
            if (!intervalsOverlapBusy(merged, cursor, slotEnd)) {
                slots.add(new IntegrationDtos.SuggestedSlot(cursor.toString(), slotEnd.toString()));
            }
            cursor = cursor.plusSeconds(15 * 60L);
        }
        auditService.append(actor.id(), "calendar.availability", "event", actor.id(), "Availability computed for " + emails.size() + " attendees");
        return new IntegrationDtos.AvailabilityResponse(slots);
    }

    public IntegrationDtos.CalendarEventView prepareMeetingAgendaDraft(UserView actor, String eventId, List<String> extraDocumentIds) {
        CalendarEvent event = requireAccessibleCalendarEvent(actor, eventId);
        StringBuilder context = new StringBuilder();
        context.append("Название встречи: ").append(event.title()).append("\n\n");
        if (!event.description().isBlank()) {
            context.append("Описание:\n").append(event.description()).append("\n\n");
        }
        List<CalendarEventAttachment> atts = calendarAttachmentPort.listByEventIdOrdered(eventId);
        List<String> docIds = new ArrayList<>();
        for (CalendarEventAttachment a : atts) {
            docIds.add(a.documentId());
        }
        if (extraDocumentIds != null) {
            docIds.addAll(extraDocumentIds);
        }
        for (String docId : new LinkedHashSet<>(docIds)) {
            try {
                DocumentDtos.DocumentView doc = documentUseCases.get(actor, docId);
                String preview = doc.extractedTextPreview() == null ? "" : doc.extractedTextPreview();
                context.append("Документ ").append(doc.title()).append(":\n").append(preview).append("\n\n");
            } catch (ResponseStatusException ignored) {
            }
        }
        LlmChatPort.ChatResponse response = llmChatPort.chat(new LlmChatPort.ChatRequest(
                "Составь краткую повестку дня для встречи в виде маркированного списка на русском.",
                List.of(context.toString()),
                "Ты помощник для корпоративного календаря. Отвечай только повесткой, без вводных фраз.",
                0.3,
                mailSummaryMaxTokens,
                "agenda-" + eventId
        ));
        String agendaText = response.answer() == null ? "" : response.answer().trim();
        CalendarEvent updated = calendarEventPort.save(new CalendarEvent(
                event.id(),
                event.title(),
                event.attendees(),
                event.startIso(),
                event.endIso(),
                event.createdBy(),
                event.createdAt(),
                Instant.now(),
                event.description().isBlank() ? agendaText : event.description() + "\n\n--- Повестка ---\n" + agendaText,
                event.creationSource(),
                event.sourceMailMessageId()
        ));
        auditService.append(actor.id(), "calendar.agenda.generated", "event", eventId, "Agenda draft generated via LLM");
        return toCalendarEventView(actor, updated);
    }

    public List<IntegrationDtos.MailMessageSummaryView> listMailMessages(UserView actor, String mailbox, String folderRaw) {
        MailFolder folder;
        try {
            folder = MailFolder.fromNullable(folderRaw);
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(BAD_REQUEST, "Invalid folder parameter");
        }
        assertMailboxAccess(actor, mailbox);
        try {
            if (folder == MailFolder.ARCHIVE) {
                auditService.append(actor.id(), "mail.messages.list", "email", mailbox,
                        "Mail archive folder stub — empty list until Mailpit/API exposes archive");
                return List.of();
            }
            if (folder == MailFolder.DRAFT) {
                List<IntegrationDtos.MailMessageSummaryView> drafts = listDraftSummaries(actor);
                auditService.append(actor.id(), "mail.messages.list", "email", mailbox + ":DRAFT", "Mail drafts listed");
                return drafts;
            }
            List<IntegrationDtos.MailMessageSummaryView> messages = mailReadPort.listMailMessages(mailbox, folder);
            auditService.append(actor.id(), "mail.messages.list", "email", mailbox + ":" + folder.name(), "Mail messages listed");
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
            Optional<IntegrationDtos.MailMessageDetailView> draft = tryLoadDraftDetail(actor, messageId);
            if (draft.isPresent()) {
                auditService.append(actor.id(), "mail.message.read", "email", messageId, "Mail draft read");
                return draft.get();
            }
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

    public List<IntegrationDtos.MailDraftView> listMailDrafts(UserView actor) {
        return mailDraftPort.listByCreatedBy(actor.id()).stream()
                .map(this::toMailDraftView)
                .toList();
    }

    public IntegrationDtos.MailDraftView updateMailDraft(
            UserView actor,
            String draftId,
            String to,
            String subject,
            String body,
            List<String> attachmentDocumentIds
    ) {
        MailDraftPort.MailDraftSummary entity = requireOwnedMailDraft(actor, draftId);
        if (to == null || to.isBlank()) {
            to = "";
        } else {
            to = to.trim();
            validateMailDraftRecipientIfPresent(to);
        }
        String safeSubject = subject == null ? "" : subject;
        String safeBody = body == null ? "" : body;
        MailDraftPort.MailDraftSummary updated = new MailDraftPort.MailDraftSummary(
                entity.id(),
                to,
                safeSubject,
                safeBody,
                entity.createdBy()
        );
        mailDraftPort.save(updated);
        replaceDraftAttachments(actor, draftId, attachmentDocumentIds);
        auditService.append(actor.id(), "mail.draft.update", "email", draftId, "Mail draft updated");
        return toMailDraftView(updated);
    }

    /** Отправка сохранённого пользователем черновика (после подтверждения в UI). */
    public IntegrationDtos.MailDraftView sendSavedMailDraft(UserView actor, String draftId) {
        MailDraftPort.MailDraftSummary entity = requireOwnedMailDraft(actor, draftId);
        if (entity.recipient() == null || entity.recipient().isBlank()) {
            throw new ResponseStatusException(BAD_REQUEST, "Recipient is required");
        }
        List<String> docIds = mailDraftPort.findAttachmentDocumentIds(draftId);
        List<IntegrationDtos.MailAttachment> attachments = resolveMailAttachmentsFromDocuments(actor, docIds);
        IntegrationDtos.MailDraftView view = toMailDraftView(entity);
        String idempotencyKey = "send-draft:" + draftId;
        try {
            IntegrationDtos.MailDraftView sent = mailCalendarPort.sendMailDraft(view, idempotencyKey, attachments, actor.email());
            mailDraftPort.deleteById(draftId);
            auditService.append(actor.id(), "mail.draft.send", "email", draftId, "Mail draft sent id=" + sent.id());
            return sent;
        } catch (ResponseStatusException ex) {
            auditService.append(actor.id(), "mail.send.failed", "email", draftId,
                    "Mail draft send failed: " + ex.getReason());
            throw ex;
        } catch (Exception ex) {
            auditService.append(actor.id(), "mail.send.failed", "email", draftId,
                    "Mail draft send failed: " + ex.getMessage());
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Mail sending failed", ex);
        }
    }

    public IntegrationDtos.MailDraftView createReplyDraft(UserView actor, String mailbox, String messageId) {
        assertMailboxAccess(actor, mailbox);
        ensureNotDraftMessageForReply(messageId);
        IntegrationDtos.MailMessageDetailView detail = mailReadPort.getMailMessage(mailbox, messageId);
        String to = extractEmailAddress(detail.from());
        if (to.isBlank()) {
            throw new ResponseStatusException(BAD_REQUEST, "Cannot resolve sender address");
        }
        String subject = detail.subject() == null || detail.subject().isBlank()
                ? "Re:"
                : (detail.subject().regionMatches(true, 0, "Re:", 0, 3)
                ? detail.subject()
                : "Re: " + detail.subject());
        String body = "\n\n--- Исходное письмо ---\n" + detail.body();
        IntegrationDtos.MailDraftView draft = mailCalendarPort.saveMailDraft(
                new IntegrationDtos.MailDraftView("mail-" + UUID.randomUUID(), to, subject, body, actor.id())
        );
        auditService.append(actor.id(), "mail.reply.draft.create", "email", draft.id(), "Reply draft from message " + messageId);
        return draft;
    }

    public IntegrationDtos.MailDraftView createForwardDraft(UserView actor, String mailbox, String messageId) {
        assertMailboxAccess(actor, mailbox);
        ensureNotDraftMessageForReply(messageId);
        IntegrationDtos.MailMessageDetailView detail = mailReadPort.getMailMessage(mailbox, messageId);
        String subject = detail.subject() == null || detail.subject().isBlank()
                ? "Fwd:"
                : (detail.subject().regionMatches(true, 0, "Fwd:", 0, 4)
                ? detail.subject()
                : "Fwd: " + detail.subject());
        String body = "\n\n---------- Пересылаемое сообщение ----------\nОт: "
                + detail.from()
                + "\nКому: "
                + detail.to()
                + "\nТема: "
                + (detail.subject() == null ? "" : detail.subject())
                + "\n\n"
                + detail.body();
        IntegrationDtos.MailDraftView draft = mailCalendarPort.saveMailDraft(
                new IntegrationDtos.MailDraftView("mail-" + UUID.randomUUID(), "", subject, body, actor.id())
        );
        auditService.append(actor.id(), "mail.forward.draft.create", "email", draft.id(), "Forward draft from message " + messageId);
        return draft;
    }

    public byte[] readMailAttachment(UserView actor, String mailbox, String messageId, String partId) {
        assertMailboxAccess(actor, mailbox);
        byte[] bytes = mailReadPort.downloadAttachmentPart(mailbox, messageId, partId);
        auditService.append(actor.id(), "mail.attachment.download", "email", messageId, "partId=" + partId);
        return bytes;
    }

    public DocumentDtos.DocumentView saveMailAttachmentToDocuments(
            UserView actor,
            String mailbox,
            String messageId,
            String partId,
            String fileNameHint
    ) {
        assertMailboxAccess(actor, mailbox);
        IntegrationDtos.MailMessageDetailView detail = mailReadPort.getMailMessage(mailbox, messageId);
        IntegrationDtos.MailAttachmentPartView part = detail.attachments().stream()
                .filter(p -> partId.equals(p.partId()))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Attachment not found in message"));
        byte[] bytes = mailReadPort.downloadAttachmentPart(mailbox, messageId, partId);
        String name = fileNameHint != null && !fileNameHint.isBlank() ? fileNameHint.trim() : part.fileName();
        DocumentDtos.DocumentView doc = documentUseCases.upload(actor, name, bytes, part.contentType());
        auditService.append(actor.id(), "mail.attachment.save_to_documents", "document", doc.id(),
                "from mail message " + messageId + " part " + partId);
        return doc;
    }

    public IntegrationDtos.MailThreadSummaryView summarizeMailThread(
            UserView actor,
            String mailbox,
            String threadId,
            IntegrationDtos.MailThreadSummaryRequest request
    ) {
        assertMailboxAccess(actor, mailbox);
        List<String> ids = new ArrayList<>();
        ids.add(threadId);
        if (request != null && request.messageIds() != null) {
            for (String id : request.messageIds()) {
                if (id != null && !id.isBlank() && !ids.contains(id)) {
                    ids.add(id);
                }
            }
        }
        StringBuilder ctx = new StringBuilder();
        for (String id : ids) {
            if (mailDraftPort.existsById(id)) {
                throw new ResponseStatusException(BAD_REQUEST, "Summarize supports Mailpit messages only, not drafts");
            }
            IntegrationDtos.MailMessageDetailView m = mailReadPort.getMailMessage(mailbox, id);
            ctx.append("Тема: ").append(m.subject()).append("\nОт: ").append(m.from()).append("\nКому: ").append(m.to())
                    .append("\nТекст:\n").append(m.body()).append("\n\n---\n\n");
        }
        String system = "Ты помощник в корпоративной почте. Кратко перескажи переписку на русском: ключевые факты, решения, открытые вопросы. Без вступлений.";
        String question = "Вот письма для анализа:\n\n" + ctx;
        try {
            LlmChatPort.ChatResponse response = llmChatPort.chat(new LlmChatPort.ChatRequest(
                    question,
                    List.of(),
                    system,
                    0.2,
                    mailSummaryMaxTokens,
                    "mail-thread-summary"
            ));
            auditService.append(actor.id(), "mail.thread.summary", "email", threadId, "messages=" + ids.size());
            return new IntegrationDtos.MailThreadSummaryView(response.answer(), response.provider(), response.model());
        } catch (Exception ex) {
            auditService.append(actor.id(), "mail.summary.failed", "email", threadId, ex.getMessage());
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Mail summary failed: " + ex.getMessage(), ex);
        }
    }

    private Optional<IntegrationDtos.MailMessageDetailView> tryLoadDraftDetail(UserView actor, String messageId) {
        Optional<MailDraftPort.MailDraftSummary> opt = mailDraftPort.findById(messageId);
        if (opt.isEmpty()) {
            return Optional.empty();
        }
        MailDraftPort.MailDraftSummary e = opt.get();
        if (!aclService.isAdmin(actor) && !e.createdBy().equals(actor.id())) {
            throw new ResponseStatusException(NOT_FOUND, "Mail message not found");
        }
        String actorMail = actor.email();
        return Optional.of(new IntegrationDtos.MailMessageDetailView(
                e.id(),
                actorMail,
                e.recipient(),
                e.subject(),
                e.body(),
                Instant.now().toString(),
                List.of()
        ));
    }

    private List<IntegrationDtos.MailMessageSummaryView> listDraftSummaries(UserView actor) {
        List<MailDraftPort.MailDraftSummary> rows = mailDraftPort.listByCreatedBy(actor.id());
        List<IntegrationDtos.MailMessageSummaryView> out = new ArrayList<>();
        for (MailDraftPort.MailDraftSummary e : rows) {
            String preview = e.body() == null ? "" : e.body();
            if (preview.length() > 200) {
                preview = preview.substring(0, 200) + "…";
            }
            out.add(new IntegrationDtos.MailMessageSummaryView(
                    e.id(),
                    actor.email(),
                    e.recipient(),
                    e.subject(),
                    preview,
                    Instant.now().toString(),
                    !mailDraftPort.findAttachmentDocumentIds(e.id()).isEmpty(),
                    true
            ));
        }
        out.sort(Comparator.comparing(IntegrationDtos.MailMessageSummaryView::id).reversed());
        return out;
    }

    private MailDraftPort.MailDraftSummary requireOwnedMailDraft(UserView actor, String draftId) {
        MailDraftPort.MailDraftSummary draft = mailDraftPort.findById(draftId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Mail draft not found"));
        if (!aclService.isAdmin(actor) && !draft.createdBy().equals(actor.id())) {
            throw new ResponseStatusException(NOT_FOUND, "Mail draft not found");
        }
        return draft;
    }

    private void ensureNotDraftMessageForReply(String messageId) {
        if (mailDraftPort.existsById(messageId)) {
            throw new ResponseStatusException(BAD_REQUEST, "Use draft editor for stored drafts");
        }
    }

    private void replaceDraftAttachments(UserView actor, String draftId, List<String> attachmentDocumentIds) {
        if (attachmentDocumentIds == null || attachmentDocumentIds.isEmpty()) {
            mailDraftPort.replaceAttachmentDocumentIds(draftId, List.of());
            return;
        }
        if (attachmentDocumentIds.size() > mailAttachmentsMaxCount) {
            throw new ResponseStatusException(BAD_REQUEST, "Too many mail attachments");
        }
        long total = 0;
        List<String> validated = new ArrayList<>();
        for (String documentId : attachmentDocumentIds) {
            DocumentDtos.DocumentBinary binary = documentUseCases.downloadLatest(actor, documentId);
            total += binary.content().length;
            if (total > mailAttachmentsMaxTotalBytes) {
                throw new ResponseStatusException(BAD_REQUEST, "Mail attachments exceed total size limit");
            }
            validated.add(documentId);
        }
        mailDraftPort.replaceAttachmentDocumentIds(draftId, validated);
    }

    private List<IntegrationDtos.MailAttachment> resolveMailAttachmentsFromDocuments(UserView actor, List<String> documentIds) {
        if (documentIds.isEmpty()) {
            return List.of();
        }
        if (documentIds.size() > mailAttachmentsMaxCount) {
            throw new ResponseStatusException(BAD_REQUEST, "Too many mail attachments");
        }
        long totalBytes = 0;
        List<IntegrationDtos.MailAttachment> attachments = new ArrayList<>(documentIds.size());
        for (String documentId : documentIds) {
            DocumentDtos.DocumentBinary binary = documentUseCases.downloadLatest(actor, documentId);
            totalBytes += binary.content().length;
            if (totalBytes > mailAttachmentsMaxTotalBytes) {
                throw new ResponseStatusException(BAD_REQUEST, "Mail attachments exceed total size limit");
            }
            attachments.add(new IntegrationDtos.MailAttachment(binary.fileName(), binary.contentType(), binary.content()));
        }
        return attachments;
    }

    private IntegrationDtos.MailDraftView toMailDraftView(MailDraftPort.MailDraftSummary e) {
        return new IntegrationDtos.MailDraftView(e.id(), e.recipient(), e.subject(), e.body(), e.createdBy());
    }

    private static String extractEmailAddress(String fromLine) {
        if (fromLine == null || fromLine.isBlank()) {
            return "";
        }
        try {
            InternetAddress[] parsed = InternetAddress.parse(fromLine.trim(), false);
            if (parsed.length > 0) {
                String addr = parsed[0].getAddress();
                if (addr != null && !addr.isBlank()) {
                    return addr.trim();
                }
            }
        } catch (AddressException ignored) {
            // пробуем разбор вида «Имя <addr@host>»
        }
        String s = fromLine.trim();
        int lt = s.lastIndexOf('<');
        int gt = s.lastIndexOf('>');
        if (lt >= 0 && gt > lt) {
            return s.substring(lt + 1, gt).trim();
        }
        return s;
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

    private void validateIsoRange(String startIso, String endIso) {
        try {
            Instant start = Instant.parse(startIso);
            Instant end = Instant.parse(endIso);
            if (!end.isAfter(start)) {
                throw new ResponseStatusException(UNPROCESSABLE_ENTITY, "endIso must be after startIso");
            }
        } catch (ResponseStatusException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new ResponseStatusException(UNPROCESSABLE_ENTITY, "Invalid ISO datetime range");
        }
    }

    private void mergeAttendeeEmail(String eventId, String email) {
        CalendarEvent event = calendarEventPort.findById(eventId).orElseThrow();
        String trimmed = email.trim();
        if (trimmed.isEmpty()) {
            return;
        }
        boolean exists = event.attendees().stream().anyMatch(a -> a.equalsIgnoreCase(trimmed));
        if (exists) {
            return;
        }
        List<String> next = new ArrayList<>(event.attendees());
        next.add(trimmed);
        calendarEventPort.save(new CalendarEvent(
                event.id(),
                event.title(),
                next,
                event.startIso(),
                event.endIso(),
                event.createdBy(),
                event.createdAt(),
                Instant.now(),
                event.description(),
                event.creationSource(),
                event.sourceMailMessageId()
        ));
    }

    private void removeAttendeeEmail(String eventId, String email) {
        CalendarEvent event = calendarEventPort.findById(eventId).orElseThrow();
        List<String> next = event.attendees().stream()
                .filter(a -> !a.equalsIgnoreCase(email.trim()))
                .toList();
        calendarEventPort.save(new CalendarEvent(
                event.id(),
                event.title(),
                next,
                event.startIso(),
                event.endIso(),
                event.createdBy(),
                event.createdAt(),
                Instant.now(),
                event.description(),
                event.creationSource(),
                event.sourceMailMessageId()
        ));
    }

    private List<String> extractEmailsFromMailParticipants(String from, String to) {
        LinkedHashSet<String> uniq = new LinkedHashSet<>();
        for (String raw : List.of(from, to)) {
            if (raw == null || raw.isBlank()) {
                continue;
            }
            for (String part : raw.split(",")) {
                String email = extractEmailAddress(part);
                if (!email.isBlank()) {
                    uniq.add(email.toLowerCase(Locale.ROOT));
                }
            }
        }
        return new ArrayList<>(uniq);
    }

    private static List<Instant[]> mergeBusyIntervals(List<Instant[]> raw) {
        if (raw.isEmpty()) {
            return List.of();
        }
        List<Instant[]> sorted = new ArrayList<>(raw);
        sorted.sort(Comparator.comparing(a -> a[0]));
        List<Instant[]> merged = new ArrayList<>();
        Instant[] cur = sorted.get(0);
        for (int i = 1; i < sorted.size(); i++) {
            Instant[] next = sorted.get(i);
            if (next[0].compareTo(cur[1]) >= 0) {
                merged.add(cur);
                cur = next;
            } else {
                Instant end = cur[1].isAfter(next[1]) ? cur[1] : next[1];
                cur = new Instant[]{cur[0], end};
            }
        }
        merged.add(cur);
        return merged;
    }

    /** Слот [slotStart, slotEnd) пересекается с занятостью. */
    private static boolean intervalsOverlapBusy(List<Instant[]> merged, Instant slotStart, Instant slotEnd) {
        for (Instant[] b : merged) {
            if (b[0].isBefore(slotEnd) && b[1].isAfter(slotStart)) {
                return true;
            }
        }
        return false;
    }

    private IntegrationDtos.CalendarEventView toCalendarEventView(UserView actor, CalendarEvent e) {
        List<CalendarEventParticipant> pRows = calendarParticipantPort.listByEventIdOrdered(e.id());
        Map<String, UserView> usersById = userAccessPort.findAllByIds(
                        pRows.stream().map(CalendarEventParticipant::userId).distinct().toList())
                .stream()
                .collect(Collectors.toMap(UserView::id, Function.identity(), (left, right) -> left));
        List<CalendarEventAttachment> aRows = calendarAttachmentPort.listByEventIdOrdered(e.id());
        Map<String, DocumentDtos.DocumentView> documentsById = documentUseCases.getAccessibleByIds(
                actor,
                aRows.stream().map(CalendarEventAttachment::documentId).distinct().toList()
        );
        return toCalendarEventView(e, pRows, aRows, usersById, documentsById);
    }

    private IntegrationDtos.CalendarEventView toCalendarEventView(
            CalendarEvent e,
            List<CalendarEventParticipant> pRows,
            List<CalendarEventAttachment> aRows,
            Map<String, UserView> usersById,
            Map<String, DocumentDtos.DocumentView> documentsById
    ) {
        List<IntegrationDtos.CalendarParticipantView> participants = new ArrayList<>();
        Set<String> coveredEmails = new HashSet<>();
        for (CalendarEventParticipant row : pRows) {
            UserView u = usersById.get(row.userId());
            if (u != null) {
                participants.add(new IntegrationDtos.CalendarParticipantView(
                        u.id(),
                        u.email(),
                        u.fullName(),
                        row.status().name()
                ));
                coveredEmails.add(u.email().toLowerCase(Locale.ROOT));
            }
        }
        for (String rawEmail : e.attendees()) {
            String em = rawEmail.trim();
            if (em.isEmpty()) {
                continue;
            }
            if (coveredEmails.contains(em.toLowerCase(Locale.ROOT))) {
                continue;
            }
            participants.add(new IntegrationDtos.CalendarParticipantView(
                    null,
                    em,
                    em,
                    EventParticipantStatus.UNKNOWN.name()
            ));
        }
        List<IntegrationDtos.CalendarAttachmentView> attachments = new ArrayList<>();
        for (CalendarEventAttachment row : aRows) {
            DocumentDtos.DocumentView document = documentsById.get(row.documentId());
            String docTitle = document != null ? document.title() : row.documentId();
            attachments.add(new IntegrationDtos.CalendarAttachmentView(
                    row.id(),
                    row.documentId(),
                    docTitle,
                    row.role().name()
            ));
        }
        return new IntegrationDtos.CalendarEventView(
                e.id(),
                e.title(),
                List.copyOf(e.attendees()),
                e.startIso(),
                e.endIso(),
                e.createdBy(),
                e.createdAt(),
                e.updatedAt(),
                e.description(),
                e.creationSource().name(),
                e.sourceMailMessageId(),
                participants,
                attachments
        );
    }
}
