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
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.net.UnknownHostException;
import java.util.ArrayList;
import java.util.Locale;
import java.util.List;

@Primary
@Component
public class MailCalendarHttpAdapter implements MailCalendarPort {
    private final MailCalendarPersistenceAdapter persistenceAdapter;
    private final ObjectProvider<JavaMailSender> mailSenderProvider;
    private final String mailFrom;

    public MailCalendarHttpAdapter(
            MailCalendarPersistenceAdapter persistenceAdapter,
            ObjectProvider<JavaMailSender> mailSenderProvider,
            @Value("${mail.from:}") String mailFrom
    ) {
        this.persistenceAdapter = persistenceAdapter;
        this.mailSenderProvider = mailSenderProvider;
        this.mailFrom = mailFrom;
    }

    @Override
    public IntegrationDtos.MailDraftView saveMailDraft(IntegrationDtos.MailDraftView draftView) {
        return persistenceAdapter.saveMailDraft(draftView);
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
            throw new ResponseStatusException(
                HttpStatus.SERVICE_UNAVAILABLE,
                "Интеграция с почтовым сервером не настроена. Задайте SMTP-параметры в конфигурации."
            );
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

}
