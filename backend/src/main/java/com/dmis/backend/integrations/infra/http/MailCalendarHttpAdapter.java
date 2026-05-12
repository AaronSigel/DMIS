package com.dmis.backend.integrations.infra.http;

import com.dmis.backend.integrations.application.dto.IntegrationDtos;
import com.dmis.backend.integrations.application.port.MailCalendarPort;
import com.dmis.backend.integrations.infra.persistence.MailCalendarPersistenceAdapter;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import jakarta.mail.Address;
import jakarta.mail.MessagingException;
import jakarta.mail.SendFailedException;
import jakarta.mail.internet.AddressException;
import jakarta.mail.internet.InternetAddress;
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
import java.net.UnknownHostException;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.Locale;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.Base64;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Primary
@Component
public class MailCalendarHttpAdapter implements MailCalendarPort {
    private static final Pattern VEVENT_BLOCK = Pattern.compile("BEGIN:VEVENT\\R(?s)(.*?)\\REND:VEVENT");
    private static final Pattern DTSTART_LINE = Pattern.compile("(?m)^DTSTART(?:;[^:]+)?:([^\\r\\n]+)$");
    private static final Pattern DTEND_LINE = Pattern.compile("(?m)^DTEND(?:;[^:]+)?:([^\\r\\n]+)$");
    private static final Pattern ATTENDEE_LINE = Pattern.compile("(?m)^ATTENDEE(?:;[^:]+)?:mailto:([^\\r\\n]+)$", Pattern.CASE_INSENSITIVE);

    private final MailCalendarPersistenceAdapter persistenceAdapter;
    private final ObjectProvider<JavaMailSender> mailSenderProvider;
    private final String mailFrom;
    private final String caldavBaseUrl;
    private final String caldavUsername;
    private final String caldavPassword;
    private final String caldavCalendarPath;

    public MailCalendarHttpAdapter(
            MailCalendarPersistenceAdapter persistenceAdapter,
            ObjectProvider<JavaMailSender> mailSenderProvider,
            @Value("${mail.from:}") String mailFrom,
            @Value("${caldav.base-url:}") String caldavBaseUrl,
            @Value("${caldav.username:}") String caldavUsername,
            @Value("${caldav.password:}") String caldavPassword,
            @Value("${caldav.calendar-path:}") String caldavCalendarPath
    ) {
        this.persistenceAdapter = persistenceAdapter;
        this.mailSenderProvider = mailSenderProvider;
        this.mailFrom = mailFrom;
        this.caldavBaseUrl = caldavBaseUrl;
        this.caldavUsername = caldavUsername;
        this.caldavPassword = caldavPassword;
        this.caldavCalendarPath = caldavCalendarPath;
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
            List<IntegrationDtos.MailAttachment> attachments,
            String senderAddress
    ) {
        JavaMailSender sender = mailSenderProvider.getIfAvailable();
        String fromRaw = senderAddress == null || senderAddress.isBlank() ? mailFrom : senderAddress;
        if (sender == null || fromRaw == null || fromRaw.isBlank()) {
            // SMTP не настроен — fallback в no-op (используется в тестах и dev-окружении).
            return draft;
        }
        List<IntegrationDtos.MailAttachment> safeAttachments = attachments == null ? List.of() : attachments;

        final InternetAddress fromAddress;
        final InternetAddress[] toAddresses;
        try {
            InternetAddress[] parsedFrom = InternetAddress.parse(normalizeSmtpAddressInput(fromRaw), true);
            if (parsedFrom.length != 1) {
                throw new AddressException("Ожидается ровно один адрес отправителя");
            }
            fromAddress = parsedFrom[0];
            String toRaw = normalizeSmtpAddressInput(draft.to() == null ? "" : draft.to());
            toRaw = toRaw.replace(';', ',');
            if (toRaw.isBlank()) {
                throw new AddressException("Не указан адрес получателя");
            }
            toAddresses = InternetAddress.parse(toRaw, true);
            if (toAddresses.length == 0) {
                throw new AddressException("Не указан адрес получателя");
            }
        } catch (AddressException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Некорректный адрес электронной почты: " + ex.getMessage(), ex);
        }

        validateLikelyAcceptedByStrictSmtp(fromAddress, toAddresses);

        try {
            MimeMessage mimeMessage = sender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(toAddresses);
            helper.setSubject(draft.subject());
            helper.setText(draft.body(), false);
            if (idempotencyKey != null && !idempotencyKey.isBlank()) {
                String safeKey = idempotencyKey.replaceAll("[^A-Za-z0-9._:+\\-]", "-");
                String domain = extractDomain(fromAddress.getAddress());
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
                    "Mail service request failed: " + smtpFailureDetail(ex), ex);
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
            RestClient client = RestClient.builder().baseUrl(caldavBaseUrl).build();
            RestClient.RequestBodySpec request = client.put()
                    .uri(buildEventPath(eventUid))
                    .header("Idempotency-Key", idempotencyKey)
                    .header("If-None-Match", "*")
                    .contentType(MediaType.parseMediaType("text/calendar; charset=UTF-8"));
            applyOptionalAuth(request);
            request.body(icsPayload).retrieve().toBodilessEntity();
        } catch (RestClientException | IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "Calendar service request failed: " + ex.getMessage(), ex);
        }
        return draft;
    }

    @Override
    public IntegrationDtos.FreeBusyView getFreeBusy(String attendee, String startIso, String endIso) {
        if (isCaldavDisabled()) {
            return new IntegrationDtos.FreeBusyView(attendee, List.of());
        }
        try {
            Instant start = Instant.parse(startIso);
            Instant end = Instant.parse(endIso);
            if (!end.isAfter(start)) {
                return new IntegrationDtos.FreeBusyView(attendee, List.of());
            }

            RestClient client = RestClient.builder().baseUrl(caldavBaseUrl).build();
            RestClient.RequestHeadersSpec<?> request = client.get().uri(buildCalendarCollectionPath());
            applyOptionalAuth(request);
            String calendarPayload = request.accept(MediaType.parseMediaType("text/calendar"))
                    .retrieve()
                    .body(String.class);
            List<IntegrationDtos.BusySlot> busySlots = extractBusySlots(calendarPayload, attendee, start, end);
            return new IntegrationDtos.FreeBusyView(attendee, busySlots);
        } catch (RestClientException | IllegalArgumentException ex) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Free/busy service request failed: " + ex.getMessage(),
                    ex
            );
        }
    }

    /**
     * Убирает символы, из‑за которых адрес выглядит верным в UI, но ломает SMTP (ZWSP, BOM, CR/LF, NBSP).
     */
    private static String normalizeSmtpAddressInput(String raw) {
        if (raw == null) {
            return "";
        }
        String s = raw.strip()
                .replace('\u00A0', ' ')
                .replaceAll("[\\u200B-\\u200D\\uFEFF]", "")
                .replace("\r", "")
                .replace("\n", "");
        return s.strip();
    }

    /**
     * Mailpit (и др. SMTP) может вернуть 553 по RFC 5321, хотя {@link InternetAddress} строку принял.
     * Отсекаем типичные для dev ошибки: домен .local и односегментные имена без точки (в т.ч. имена Docker-сервисов).
     */
    private static void validateLikelyAcceptedByStrictSmtp(InternetAddress from, InternetAddress[] to) {
        List<String> rejected = new ArrayList<>();
        String fromAddr = from == null ? null : from.getAddress();
        collectIfSmtpLikelyRejected(fromAddr, rejected);
        if (to != null) {
            for (InternetAddress a : to) {
                collectIfSmtpLikelyRejected(a == null ? null : a.getAddress(), rejected);
            }
        }
        if (!rejected.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Адрес не проходит проверку SMTP (RFC 5321): "
                            + String.join(", ", rejected)
                            + ". Укажите почту вида user@example.com; не используйте домены .local "
                            + "и не подставляйте имя контейнера (например user@mailpit) вместо домена.");
        }
    }

    private static void collectIfSmtpLikelyRejected(String addr, List<String> rejected) {
        if (addr == null || addr.isBlank()) {
            return;
        }
        int at = addr.lastIndexOf('@');
        if (at < 1 || at == addr.length() - 1) {
            // No proper local@domain structure — SMTP will reject with 5xx.
            rejected.add(addr);
            return;
        }
        String domain = addr.substring(at + 1).trim().toLowerCase(Locale.ROOT);
        if (domain.isEmpty()) {
            rejected.add(addr);
            return;
        }
        if (domain.endsWith(".local")) {
            rejected.add(addr);
            return;
        }
        if (!domain.contains(".") && !"localhost".equals(domain)) {
            rejected.add(addr);
        }
    }

    /**
     * Человекочитаемое описание сбоя SMTP (DNS, отклонённые адреса и т.д.).
     */
    private static String smtpFailureDetail(Throwable ex) {
        // Spring's MailSendException stores per-message failures in a map, not as getCause().
        // Collect all candidates from both the direct cause chain and MailSendException's map.
        List<Throwable> candidates = new ArrayList<>();
        for (Throwable t = ex; t != null; t = t.getCause()) {
            candidates.add(t);
        }
        if (ex instanceof org.springframework.mail.MailSendException mse) {
            for (Exception failed : mse.getFailedMessages().values()) {
                for (Throwable t = failed; t != null; t = t.getCause()) {
                    candidates.add(t);
                }
            }
        }
        for (Throwable t : candidates) {
            if (t instanceof SendFailedException sf) {
                StringBuilder sb = new StringBuilder();
                sb.append("SMTP отклонил адрес (проверьте MAIL_FROM и поле «Кому»");
                Address[] invalid = sf.getInvalidAddresses();
                if (invalid != null && invalid.length > 0) {
                    sb.append("; отклонены: ");
                    for (int i = 0; i < invalid.length; i++) {
                        if (i > 0) {
                            sb.append(", ");
                        }
                        sb.append(invalid[i] != null ? invalid[i].toString() : "?");
                    }
                }
                sb.append("): ");
                String m = sf.getMessage();
                sb.append(m != null ? m : sf.getClass().getSimpleName());
                return sb.toString();
            }
            if (t instanceof UnknownHostException uh) {
                String host = uh.getMessage();
                String hostPart = (host != null && !host.isBlank()) ? " («" + host + "»)" : "";
                return "SMTP-хост не найден в DNS" + hostPart
                        + ". Проверьте SMTP_HOST: имя должно резолвиться из среды, где запущен backend "
                        + "(в docker-compose обычно mailpit; на хосте — localhost при пробросе порта 1025).";
            }
            String name = t.getClass().getName();
            if (name.endsWith("SMTPAddressFailedException")) {
                String m = t.getMessage();
                return "SMTP отклонил адрес: " + (m != null ? m : name);
            }
        }
        String msg = ex.getMessage();
        return msg != null ? msg : ex.getClass().getSimpleName();
    }

    /** Домен для заголовка Message-ID из уже распарсенного адреса. */
    private static String extractDomain(String emailAddress) {
        if (emailAddress == null) {
            return "example.com";
        }
        int at = emailAddress.lastIndexOf('@');
        if (at < 0 || at == emailAddress.length() - 1) {
            return "example.com";
        }
        String domain = emailAddress.substring(at + 1).trim();
        return domain.isEmpty() ? "example.com" : domain;
    }

    private boolean isCaldavDisabled() {
        return isBlank(caldavBaseUrl) || isBlank(caldavCalendarPath);
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

    private void applyOptionalAuth(RestClient.RequestHeadersSpec<?> spec) {
        if (!isBlank(caldavUsername) && !isBlank(caldavPassword)) {
            spec.header("Authorization", basicAuthHeader(caldavUsername, caldavPassword));
        }
    }

    private String buildCalendarCollectionPath() {
        String basePath = caldavCalendarPath.trim();
        if (!basePath.startsWith("/")) {
            basePath = "/" + basePath;
        }
        if (!basePath.endsWith("/")) {
            basePath = basePath + "/";
        }
        return basePath;
    }

    private String buildEventPath(String eventUid) {
        return buildCalendarCollectionPath() + eventUid + ".ics";
    }

    private static List<IntegrationDtos.BusySlot> extractBusySlots(
            String calendarPayload,
            String attendee,
            Instant rangeStart,
            Instant rangeEnd
    ) {
        if (isBlank(calendarPayload)) {
            return List.of();
        }
        List<IntegrationDtos.BusySlot> busySlots = new ArrayList<>();
        Matcher blockMatcher = VEVENT_BLOCK.matcher(calendarPayload);
        while (blockMatcher.find()) {
            String eventBlock = blockMatcher.group(1);
            if (!matchesAttendee(eventBlock, attendee)) {
                continue;
            }
            Instant eventStart = extractInstant(DTSTART_LINE, eventBlock);
            if (eventStart == null) {
                continue;
            }
            Instant eventEnd = extractInstant(DTEND_LINE, eventBlock);
            if (eventEnd == null || !eventEnd.isAfter(eventStart)) {
                eventEnd = eventStart.plus(Duration.ofHours(1));
            }
            if (!eventEnd.isAfter(rangeStart) || !eventStart.isBefore(rangeEnd)) {
                continue;
            }
            Instant clippedStart = eventStart.isBefore(rangeStart) ? rangeStart : eventStart;
            Instant clippedEnd = eventEnd.isAfter(rangeEnd) ? rangeEnd : eventEnd;
            if (clippedEnd.isAfter(clippedStart)) {
                busySlots.add(new IntegrationDtos.BusySlot(clippedStart.toString(), clippedEnd.toString()));
            }
        }
        return busySlots;
    }

    private static boolean matchesAttendee(String eventBlock, String attendee) {
        if (isBlank(attendee)) {
            return true;
        }
        String normalizedAttendee = attendee.trim().toLowerCase();
        Matcher attendeeMatcher = ATTENDEE_LINE.matcher(eventBlock);
        boolean hasAttendees = false;
        while (attendeeMatcher.find()) {
            hasAttendees = true;
            String value = attendeeMatcher.group(1);
            if (value != null && value.trim().equalsIgnoreCase(normalizedAttendee)) {
                return true;
            }
        }
        if (!hasAttendees) {
            return true;
        }
        return false;
    }

    private static Instant extractInstant(Pattern pattern, String eventBlock) {
        Matcher matcher = pattern.matcher(eventBlock);
        if (!matcher.find()) {
            return null;
        }
        String value = matcher.group(1);
        if (value == null || value.isBlank()) {
            return null;
        }
        String normalized = value.trim();
        if (!normalized.endsWith("Z")) {
            normalized = normalized + "Z";
        }
        if (normalized.length() == 16 && normalized.charAt(8) == 'T') {
            normalized = normalized.substring(0, 8) + "T" + normalized.substring(9, 15) + "Z";
        }
        try {
            if (normalized.matches("^\\d{8}T\\d{6}Z$")) {
                String iso = normalized.substring(0, 4) + "-" + normalized.substring(4, 6) + "-" + normalized.substring(6, 8)
                        + "T" + normalized.substring(9, 11) + ":" + normalized.substring(11, 13) + ":" + normalized.substring(13, 15) + "Z";
                return Instant.parse(iso);
            }
            return Instant.parse(normalized);
        } catch (Exception ex) {
            return null;
        }
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
        calendar.add(new ProdId("-//DMIS//CalDAV Adapter//RU"));
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

}
