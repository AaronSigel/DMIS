package com.dmis.backend.integrations.infra.mail;

import com.dmis.backend.integrations.application.dto.IntegrationDtos;
import com.dmis.backend.integrations.application.port.MailReadPort;
import com.dmis.backend.integrations.domain.model.MailFolder;
import com.dmis.backend.platform.error.ApiException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.regex.Pattern;

@Component
@org.springframework.context.annotation.Primary
public class ImapMailReadAdapter implements MailReadPort {
    private static final int DEFAULT_LIST_LIMIT = 50;
    private static final int DEFAULT_FETCH_LIMIT = 200;
    private static final Pattern TAGS = Pattern.compile("<[^>]+>");

    private final RestClient restClient;

    public ImapMailReadAdapter(
            RestClient.Builder restClientBuilder,
            @Value("${mailpit.base-url:http://mailpit:8025}") String mailpitBaseUrl
    ) {
        this.restClient = restClientBuilder.baseUrl(trimTrailingSlash(mailpitBaseUrl)).build();
    }

    @Override
    public List<IntegrationDtos.MailMessageSummaryView> listMailMessages(String mailbox, MailFolder folder) {
        String normalizedMailbox = normalizeMailbox(mailbox);
        try {
            MailpitMessagesResponse response = restClient.get()
                    .uri("/api/v1/messages?start=0&limit={limit}", DEFAULT_FETCH_LIMIT)
                    .retrieve()
                    .body(MailpitMessagesResponse.class);
            List<MailpitMessageSummary> messages = response == null ? List.of() : safeList(response.messages);
            List<IntegrationDtos.MailMessageSummaryView> mapped = new ArrayList<>();
            for (MailpitMessageSummary message : messages) {
                if (!matchesFolderFilter(message, normalizedMailbox, folder)) {
                    continue;
                }
                mapped.add(toSummary(message));
            }
            mapped.sort(Comparator.comparing(IntegrationDtos.MailMessageSummaryView::sentAtIso).reversed());
            if (mapped.size() > DEFAULT_LIST_LIMIT) {
                mapped = mapped.subList(0, DEFAULT_LIST_LIMIT);
            }
            return mapped;
        } catch (ApiException ex) {
            throw ex;
        } catch (ResponseStatusException ex) {
            throw new ApiException(toHttpStatus(ex.getStatusCode().value()), "MAIL_READ_FAILED",
                    "Mail read failed: " + ex.getReason());
        } catch (Exception ex) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "MAIL_READ_FAILED", "Mail read failed: " + ex.getMessage());
        }
    }

    @Override
    public IntegrationDtos.MailMessageDetailView getMailMessage(String mailbox, String messageId) {
        String normalizedMailbox = normalizeMailbox(mailbox);
        if (messageId == null || messageId.isBlank()) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "MAIL_MESSAGE_ID_INVALID", "Invalid mail message id");
        }
        try {
            MailpitMessageDetail message = restClient.get()
                    .uri("/api/v1/message/{id}", messageId)
                    .retrieve()
                    .body(MailpitMessageDetail.class);
            if (message == null || !hasMailboxAccess(message, normalizedMailbox)) {
                throw new ApiException(HttpStatus.NOT_FOUND, "MAIL_MESSAGE_NOT_FOUND", "Mail message not found");
            }
            return toDetail(message);
        } catch (ApiException ex) {
            throw ex;
        } catch (ResponseStatusException ex) {
            if (ex.getStatusCode() == HttpStatus.NOT_FOUND) {
                throw new ApiException(HttpStatus.NOT_FOUND, "MAIL_MESSAGE_NOT_FOUND", "Mail message not found");
            }
            throw new ApiException(toHttpStatus(ex.getStatusCode().value()), "MAIL_READ_FAILED",
                    "Mail read failed: " + ex.getReason());
        } catch (Exception ex) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "MAIL_READ_FAILED", "Mail read failed: " + ex.getMessage());
        }
    }

    @Override
    public IntegrationDtos.MailMessageSearchView searchMailMessages(
            String mailbox,
            IntegrationDtos.MailMessageSearchRequest request
    ) {
        String normalizedMailbox = normalizeMailbox(mailbox);
        MailFolder folder = MailFolder.fromNullable(request == null ? null : request.folder());
        String query = request == null ? "" : safeTrim(request.query());
        int limit = request == null ? DEFAULT_LIST_LIMIT : Math.max(1, Math.min(request.limit(), 200));
        if (query.isBlank()) {
            return new IntegrationDtos.MailMessageSearchView("", List.of());
        }
        try {
            MailpitMessagesResponse response = restClient.get()
                    .uri("/api/v1/messages?start=0&limit={limit}", DEFAULT_FETCH_LIMIT)
                    .retrieve()
                    .body(MailpitMessagesResponse.class);
            List<MailpitMessageSummary> messages = response == null ? List.of() : safeList(response.messages);
            List<IntegrationDtos.MailMessageSummaryView> mapped = new ArrayList<>();
            for (MailpitMessageSummary message : messages) {
                if (!matchesFolderFilter(message, normalizedMailbox, folder)) {
                    continue;
                }
                IntegrationDtos.MailMessageSummaryView summary = toSummary(message);
                if (matchesQuery(summary, query)) {
                    mapped.add(summary);
                }
            }
            mapped.sort(Comparator.comparing(IntegrationDtos.MailMessageSummaryView::sentAtIso).reversed());
            if (mapped.size() > limit) {
                mapped = mapped.subList(0, limit);
            }
            return new IntegrationDtos.MailMessageSearchView(query, mapped);
        } catch (ApiException ex) {
            throw ex;
        } catch (ResponseStatusException ex) {
            throw new ApiException(toHttpStatus(ex.getStatusCode().value()), "MAIL_SEARCH_FAILED",
                    "Mail search failed: " + ex.getReason());
        } catch (Exception ex) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "MAIL_SEARCH_FAILED", "Mail search failed: " + ex.getMessage());
        }
    }

    @Override
    public byte[] downloadAttachmentPart(String mailbox, String messageId, String partId) {
        String normalizedMailbox = normalizeMailbox(mailbox);
        if (messageId == null || messageId.isBlank() || partId == null || partId.isBlank()) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "MAIL_ATTACHMENT_INVALID", "Invalid message or part id");
        }
        try {
            MailpitMessageDetail message = restClient.get()
                    .uri("/api/v1/message/{id}", messageId)
                    .retrieve()
                    .body(MailpitMessageDetail.class);
            if (message == null || !hasMailboxAccess(message, normalizedMailbox)) {
                throw new ApiException(HttpStatus.NOT_FOUND, "MAIL_MESSAGE_NOT_FOUND", "Mail message not found");
            }
            byte[] body = restClient.get()
                    .uri("/api/v1/message/{id}/part/{partId}", messageId, partId)
                    .retrieve()
                    .body(byte[].class);
            if (body == null) {
                throw new ApiException(HttpStatus.NOT_FOUND, "MAIL_ATTACHMENT_NOT_FOUND", "Attachment not found");
            }
            return body;
        } catch (ApiException ex) {
            throw ex;
        } catch (ResponseStatusException ex) {
            if (ex.getStatusCode() == HttpStatus.NOT_FOUND) {
                throw new ApiException(HttpStatus.NOT_FOUND, "MAIL_ATTACHMENT_NOT_FOUND", "Attachment not found");
            }
            throw new ApiException(toHttpStatus(ex.getStatusCode().value()), "MAIL_READ_FAILED",
                    "Attachment download failed: " + ex.getReason());
        } catch (Exception ex) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "MAIL_READ_FAILED", "Attachment download failed: " + ex.getMessage());
        }
    }

    private static boolean matchesFolderFilter(MailpitMessageSummary message, String mailbox, MailFolder folder) {
        return switch (folder) {
            case INBOX -> hasMailboxRecipient(message, mailbox);
            case SENT -> fromAddressEquals(message.From, mailbox);
            case DRAFT -> false;
            case ARCHIVE -> false;
            case ATTACHMENTS -> summaryHasAttachments(message)
                    && (hasMailboxRecipient(message, mailbox) || fromAddressEquals(message.From, mailbox));
        };
    }

    private static boolean hasMailboxAccess(MailpitMessageDetail message, String mailbox) {
        return containsMailbox(safeList(message.To), mailbox)
                || containsMailbox(safeList(message.Cc), mailbox)
                || containsMailbox(safeList(message.Bcc), mailbox)
                || fromAddressEquals(message.From, mailbox);
    }

    private static boolean summaryHasAttachments(MailpitMessageSummary message) {
        Long n = message.Attachments;
        return n != null && n > 0;
    }

    private static boolean fromAddressEquals(MailpitAddress from, String mailbox) {
        if (from == null) {
            return false;
        }
        String email = safeTrim(from.Address);
        return !email.isBlank() && email.equalsIgnoreCase(mailbox);
    }

    private static String normalizeMailbox(String mailbox) {
        String value = safeTrim(mailbox);
        if (value.isBlank()) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "MAILBOX_NOT_FOUND", "Mailbox not found");
        }
        return value.toLowerCase();
    }

    private IntegrationDtos.MailMessageSummaryView toSummary(MailpitMessageSummary message) {
        String id = safeTrim(message.ID);
        if (id.isBlank()) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "MAIL_READ_INVALID_RESPONSE", "Message ID is missing");
        }
        String from = formatAddress(message.From);
        String to = formatAddresses(safeList(message.To));
        String subject = safeTrim(message.Subject);
        String preview = safeTrim(message.Snippet);
        String sentAtIso = toIso(message.Created);
        boolean hasAtt = summaryHasAttachments(message);
        return new IntegrationDtos.MailMessageSummaryView(id, from, to, subject, preview, sentAtIso, hasAtt, false);
    }

    private IntegrationDtos.MailMessageDetailView toDetail(MailpitMessageDetail message) {
        String id = safeTrim(message.ID);
        if (id.isBlank()) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "MAIL_READ_INVALID_RESPONSE", "Message ID is missing");
        }
        String from = formatAddress(message.From);
        String to = formatAddresses(safeList(message.To));
        String subject = safeTrim(message.Subject);
        String body = normalizeText(safeTrim(message.Text));
        if (body.isBlank()) {
            body = normalizeText(stripHtml(safeTrim(message.HTML)));
        }
        List<IntegrationDtos.MailAttachmentPartView> attachments = mapAttachments(safeList(message.Attachments));
        return new IntegrationDtos.MailMessageDetailView(id, from, to, subject, body, toIso(message.Date), attachments);
    }

    private static List<IntegrationDtos.MailAttachmentPartView> mapAttachments(List<MailpitAttachment> attachments) {
        if (attachments.isEmpty()) {
            return List.of();
        }
        List<IntegrationDtos.MailAttachmentPartView> out = new ArrayList<>();
        for (MailpitAttachment a : attachments) {
            if (a == null || safeTrim(a.PartID).isBlank()) {
                continue;
            }
            String ct = safeTrim(a.ContentType);
            if (ct.isBlank()) {
                ct = "application/octet-stream";
            }
            long size = a.Size <= 0 ? 0L : a.Size;
            out.add(new IntegrationDtos.MailAttachmentPartView(
                    safeTrim(a.PartID),
                    safeTrim(a.FileName).isBlank() ? "attachment" : safeTrim(a.FileName),
                    ct,
                    size
            ));
        }
        return out;
    }

    private static boolean hasMailboxRecipient(MailpitMessageSummary message, String mailbox) {
        return containsMailbox(safeList(message.To), mailbox)
                || containsMailbox(safeList(message.Cc), mailbox)
                || containsMailbox(safeList(message.Bcc), mailbox);
    }

    private static boolean containsMailbox(List<MailpitAddress> addresses, String mailbox) {
        for (MailpitAddress address : addresses) {
            String email = safeTrim(address == null ? null : address.Address);
            if (!email.isBlank() && email.equalsIgnoreCase(mailbox)) {
                return true;
            }
        }
        return false;
    }

    private static String formatAddresses(List<MailpitAddress> addresses) {
        List<String> parts = new ArrayList<>();
        for (MailpitAddress address : addresses) {
            String item = formatAddress(address);
            if (!item.isBlank()) {
                parts.add(item);
            }
        }
        return String.join(", ", parts);
    }

    private static String formatAddress(MailpitAddress address) {
        if (address == null) {
            return "";
        }
        String email = safeTrim(address.Address);
        if (email.isBlank()) {
            return "";
        }
        String name = safeTrim(address.Name);
        return name.isBlank() ? email : name + " <" + email + ">";
    }

    private static String toIso(String value) {
        String date = safeTrim(value);
        if (date.isBlank()) {
            return Instant.EPOCH.toString();
        }
        try {
            return Instant.parse(date).toString();
        } catch (Exception ex) {
            return date;
        }
    }

    private static String trimTrailingSlash(String value) {
        String normalized = safeTrim(value);
        if (normalized.endsWith("/")) {
            return normalized.substring(0, normalized.length() - 1);
        }
        return normalized;
    }

    private static String safeTrim(String value) {
        return value == null ? "" : value.trim();
    }

    private static String stripHtml(String html) {
        String noTags = TAGS.matcher(html).replaceAll(" ");
        return noTags
                .replace("&nbsp;", " ")
                .replace("&lt;", "<")
                .replace("&gt;", ">")
                .replace("&amp;", "&");
    }

    private static String normalizeText(String text) {
        if (text == null) return "";
        return text.replace("\r\n", "\n").replace('\r', '\n').trim();
    }

    private static boolean matchesQuery(IntegrationDtos.MailMessageSummaryView summary, String query) {
        String normalized = query.toLowerCase();
        return summary.subject().toLowerCase().contains(normalized)
                || summary.from().toLowerCase().contains(normalized)
                || summary.preview().toLowerCase().contains(normalized);
    }

    private static <T> List<T> safeList(List<T> value) {
        return value == null ? List.of() : value;
    }

    private static HttpStatus toHttpStatus(int code) {
        HttpStatus status = HttpStatus.resolve(code);
        return status == null ? HttpStatus.BAD_GATEWAY : status;
    }

    private static final class MailpitMessagesResponse {
        public List<MailpitMessageSummary> messages;
    }

    private static final class MailpitMessageSummary {
        public String ID;
        public MailpitAddress From;
        public List<MailpitAddress> To;
        public List<MailpitAddress> Cc;
        public List<MailpitAddress> Bcc;
        public String Subject;
        public String Snippet;
        public String Created;
        /**
         * В ответе списка сообщений Mailpit передаёт число (вложения есть/нет или счётчик),
         * не массив объектов — см. MessageSummary в API v1.
         */
        public Long Attachments;
    }

    private static final class MailpitMessageDetail {
        public String ID;
        public MailpitAddress From;
        public List<MailpitAddress> To;
        public List<MailpitAddress> Cc;
        public List<MailpitAddress> Bcc;
        public String Subject;
        public String Text;
        public String HTML;
        public String Date;
        public List<MailpitAttachment> Attachments;
    }

    private static final class MailpitAttachment {
        public String PartID;
        public String FileName;
        public String ContentType;
        public long Size;
    }

    private static final class MailpitAddress {
        public String Address;
        public String Name;
    }
}
