package com.dmis.backend.integrations.infra.http;

import com.dmis.backend.integrations.application.dto.IntegrationDtos;
import com.dmis.backend.integrations.application.port.MailCalendarPort;
import com.dmis.backend.integrations.infra.persistence.MailCalendarPersistenceAdapter;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import net.fortuna.ical4j.model.Calendar;
import net.fortuna.ical4j.model.component.VEvent;
import net.fortuna.ical4j.model.parameter.Role;
import net.fortuna.ical4j.model.property.Attendee;
import net.fortuna.ical4j.model.property.CalScale;
import net.fortuna.ical4j.model.property.DtStamp;
import net.fortuna.ical4j.model.property.ProdId;
import net.fortuna.ical4j.model.property.Uid;
import net.fortuna.ical4j.model.property.Version;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.server.ResponseStatusException;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.Base64;

@Primary
@Component
public class MailCalendarHttpAdapter implements MailCalendarPort {

    private final MailCalendarPersistenceAdapter persistenceAdapter;
    private final ObjectProvider<JavaMailSender> mailSenderProvider;
    private final String mailFrom;
    private final String sogoBaseUrl;
    private final String sogoCaldavBaseUrl;
    private final String sogoCaldavUsername;
    private final String sogoCaldavPassword;
    private final String sogoCaldavCalendarPath;

    public MailCalendarHttpAdapter(
            MailCalendarPersistenceAdapter persistenceAdapter,
            ObjectProvider<JavaMailSender> mailSenderProvider,
            @Value("${mail.from:}") String mailFrom,
            @Value("${sogo.base-url:}") String sogoBaseUrl,
            @Value("${sogo.caldav.base-url:}") String sogoCaldavBaseUrl,
            @Value("${sogo.caldav.username:}") String sogoCaldavUsername,
            @Value("${sogo.caldav.password:}") String sogoCaldavPassword,
            @Value("${sogo.caldav.calendar-path:}") String sogoCaldavCalendarPath
    ) {
        this.persistenceAdapter = persistenceAdapter;
        this.mailSenderProvider = mailSenderProvider;
        this.mailFrom = mailFrom;
        this.sogoBaseUrl = sogoBaseUrl;
        this.sogoCaldavBaseUrl = sogoCaldavBaseUrl;
        this.sogoCaldavUsername = sogoCaldavUsername;
        this.sogoCaldavPassword = sogoCaldavPassword;
        this.sogoCaldavCalendarPath = sogoCaldavCalendarPath;
    }

    @Override
    public IntegrationDtos.MailDraftView saveMailDraft(IntegrationDtos.MailDraftView draftView) {
        return persistenceAdapter.saveMailDraft(draftView);
    }

    @Override
    public IntegrationDtos.CalendarDraftView saveCalendarDraft(IntegrationDtos.CalendarDraftView draftView) {
        return persistenceAdapter.saveCalendarDraft(draftView);
    }

    @Override
    public IntegrationDtos.MailDraftView sendMailDraft(
            IntegrationDtos.MailDraftView draft,
            String idempotencyKey,
            List<IntegrationDtos.MailAttachment> attachments
    ) {
        JavaMailSender sender = mailSenderProvider.getIfAvailable();
        if (sender == null || mailFrom == null || mailFrom.isBlank()) {
            // SMTP не настроен — fallback в no-op (используется в тестах и dev-окружении).
            return draft;
        }
        List<IntegrationDtos.MailAttachment> safeAttachments = attachments == null ? List.of() : attachments;
        try {
            MimeMessage mimeMessage = sender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setFrom(mailFrom);
            helper.setTo(draft.to());
            helper.setSubject(draft.subject());
            helper.setText(draft.body(), false);
            if (idempotencyKey != null && !idempotencyKey.isBlank()) {
                String safeKey = idempotencyKey.replaceAll("[^A-Za-z0-9._:+\\-]", "-");
                String domain = extractDomain(mailFrom);
                mimeMessage.setHeader("Message-ID", "<" + safeKey + "@" + domain + ">");
                mimeMessage.setHeader("X-Idempotency-Key", idempotencyKey);
            }
            for (IntegrationDtos.MailAttachment attachment : safeAttachments) {
                String contentType = attachment.contentType();
                if (contentType == null || contentType.isBlank()) {
                    contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
                }
                helper.addAttachment(
                        attachment.fileName(),
                        new ByteArrayResource(attachment.content()),
                        contentType
                );
            }
            sender.send(mimeMessage);
        } catch (MailException | MessagingException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "Mail service request failed: " + ex.getMessage(), ex);
        }
        return draft;
    }

    @Override
    public IntegrationDtos.CalendarDraftView sendCalendarDraft(IntegrationDtos.CalendarDraftView draft, String idempotencyKey) {
        if (isCaldavDisabled()) {
            return draft;
        }
        try {
            String eventUid = toEventUid(idempotencyKey, draft.id());
            String icsPayload = buildIcsPayload(draft, eventUid);
            String authHeader = basicAuthHeader(sogoCaldavUsername, sogoCaldavPassword);
            RestClient client = RestClient.builder().baseUrl(sogoCaldavBaseUrl).build();
            client.put()
                    .uri(buildEventPath(eventUid))
                    .header("Authorization", authHeader)
                    .header("Idempotency-Key", idempotencyKey)
                    .header("If-None-Match", "*")
                    .contentType(MediaType.parseMediaType("text/calendar; charset=UTF-8"))
                    .body(icsPayload)
                    .retrieve()
                    .toBodilessEntity();
        } catch (RestClientException | IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "Calendar service request failed: " + ex.getMessage(), ex);
        }
        return draft;
    }

    @Override
    public IntegrationDtos.FreeBusyView getFreeBusy(String attendee, String startIso, String endIso) {
        if (sogoBaseUrl == null || sogoBaseUrl.isBlank()) {
            return new IntegrationDtos.FreeBusyView(attendee, List.of());
        }
        try {
            RestClient client = RestClient.builder().baseUrl(sogoBaseUrl).build();
            FreeBusyResponse response = client.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/SOGo/dav/freebusy")
                            .queryParam("attendee", attendee)
                            .queryParam("start", startIso)
                            .queryParam("end", endIso)
                            .build())
                    .retrieve()
                    .body(FreeBusyResponse.class);
            if (response == null || response.busySlots() == null) {
                return new IntegrationDtos.FreeBusyView(attendee, List.of());
            }
            return new IntegrationDtos.FreeBusyView(attendee, response.busySlots());
        } catch (RestClientException ex) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Free/busy service request failed: " + ex.getMessage(),
                    ex
            );
        }
    }

    private static String extractDomain(String mailFrom) {
        if (mailFrom == null) {
            return "dmis.local";
        }
        int at = mailFrom.lastIndexOf('@');
        if (at < 0 || at == mailFrom.length() - 1) {
            return "dmis.local";
        }
        String domain = mailFrom.substring(at + 1).trim();
        return domain.isEmpty() ? "dmis.local" : domain;
    }

    private boolean isCaldavDisabled() {
        return isBlank(sogoCaldavBaseUrl)
                || isBlank(sogoCaldavUsername)
                || isBlank(sogoCaldavPassword)
                || isBlank(sogoCaldavCalendarPath);
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private static String toEventUid(String idempotencyKey, String fallbackId) {
        String raw = isBlank(idempotencyKey) ? fallbackId : idempotencyKey;
        if (isBlank(raw)) {
            return UUID.randomUUID().toString();
        }
        String sanitized = raw.replaceAll("[^A-Za-z0-9._:+\\-]", "-");
        return sanitized.isBlank() ? UUID.randomUUID().toString() : sanitized;
    }

    private static String basicAuthHeader(String username, String password) {
        String token = username + ":" + password;
        String encoded = Base64.getEncoder().encodeToString(token.getBytes(StandardCharsets.UTF_8));
        return "Basic " + encoded;
    }

    private String buildEventPath(String eventUid) {
        String basePath = sogoCaldavCalendarPath.trim();
        if (!basePath.startsWith("/")) {
            basePath = "/" + basePath;
        }
        if (!basePath.endsWith("/")) {
            basePath = basePath + "/";
        }
        return basePath + eventUid + ".ics";
    }

    private static String buildIcsPayload(IntegrationDtos.CalendarDraftView draft, String eventUid) {
        ZoneId zoneId = ZoneId.of("UTC");
        ZonedDateTime start = Instant.parse(draft.startIso()).atZone(zoneId);
        ZonedDateTime end = Instant.parse(draft.endIso()).atZone(zoneId);

        VEvent event = new VEvent(start, end, draft.title());
        event.add(new Uid(eventUid));
        event.add(new DtStamp(Instant.now()));
        for (String attendeeValue : normalizeAttendees(draft.attendees())) {
            Attendee attendee = new Attendee(URI.create("mailto:" + attendeeValue));
            attendee.add(Role.REQ_PARTICIPANT);
            event.add(attendee);
        }

        Calendar calendar = new Calendar();
        calendar.add(new ProdId("-//DMIS//CalDAV SOGo//RU"));
        calendar.add(new Version("2.0", "2.0"));
        calendar.add(new CalScale("GREGORIAN"));
        calendar.add(event);
        return calendar.toString();
    }

    private static List<String> normalizeAttendees(List<String> attendees) {
        if (attendees == null) {
            return List.of();
        }
        return attendees.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(value -> !value.isEmpty())
                .collect(Collectors.toList());
    }

    private record FreeBusyResponse(List<IntegrationDtos.BusySlot> busySlots) {
    }
}
