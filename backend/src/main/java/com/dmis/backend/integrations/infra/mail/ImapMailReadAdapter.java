package com.dmis.backend.integrations.infra.mail;

import com.dmis.backend.integrations.application.dto.IntegrationDtos;
import com.dmis.backend.integrations.application.port.MailAccountPort;
import com.dmis.backend.integrations.application.port.MailReadPort;
import com.dmis.backend.platform.crypto.AesGcmCryptoService;
import com.dmis.backend.platform.error.ApiException;
import com.dmis.backend.users.infra.persistence.entity.UserEntity;
import com.dmis.backend.users.infra.persistence.repository.UserJpaRepository;
import jakarta.mail.BodyPart;
import jakarta.mail.Folder;
import jakarta.mail.Message;
import jakarta.mail.MessagingException;
import jakarta.mail.Multipart;
import jakarta.mail.Part;
import jakarta.mail.Session;
import jakarta.mail.Store;
import jakarta.mail.UIDFolder;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.search.BodyTerm;
import jakarta.mail.search.FromStringTerm;
import jakarta.mail.search.OrTerm;
import jakarta.mail.search.SearchTerm;
import jakarta.mail.search.SubjectTerm;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.Properties;
import java.util.regex.Pattern;

import static org.springframework.http.HttpStatus.BAD_GATEWAY;
import static org.springframework.http.HttpStatus.NOT_FOUND;
import static org.springframework.http.HttpStatus.UNPROCESSABLE_ENTITY;

@Component
@org.springframework.context.annotation.Primary
public class ImapMailReadAdapter implements MailReadPort {
    private static final int DEFAULT_LIST_LIMIT = 50;
    private static final Pattern TAGS = Pattern.compile("<[^>]+>");

    private final UserJpaRepository userRepository;
    private final MailAccountPort mailAccountPort;
    private final AesGcmCryptoService cryptoService;
    private final String defaultHost;
    private final int defaultPort;

    public ImapMailReadAdapter(
            UserJpaRepository userRepository,
            MailAccountPort mailAccountPort,
            AesGcmCryptoService cryptoService,
            @Value("${mail.imap.host:}") String defaultHost,
            @Value("${mail.imap.port:993}") int defaultPort
    ) {
        this.userRepository = userRepository;
        this.mailAccountPort = mailAccountPort;
        this.cryptoService = cryptoService;
        this.defaultHost = defaultHost;
        this.defaultPort = defaultPort;
    }

    @Override
    public List<IntegrationDtos.MailMessageSummaryView> listMailMessages(String mailbox) {
        MailSession session = resolveSession(mailbox);
        try (Store store = session.openStore();
             Folder inbox = openInbox(store)) {
            int messageCount = inbox.getMessageCount();
            if (messageCount <= 0) {
                return List.of();
            }
            int limit = DEFAULT_LIST_LIMIT;
            int start = Math.max(1, messageCount - limit + 1);
            Message[] messages = inbox.getMessages(start, messageCount);

            UIDFolder uidFolder = toUidFolder(inbox);
            List<IntegrationDtos.MailMessageSummaryView> mapped = new ArrayList<>(messages.length);
            for (Message message : messages) {
                mapped.add(toSummary(uidFolder, message));
            }
            mapped.sort(Comparator.comparing(IntegrationDtos.MailMessageSummaryView::sentAtIso).reversed());
            return mapped;
        } catch (ApiException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new ApiException(BAD_GATEWAY, "MAIL_READ_FAILED", "Mail read failed: " + ex.getMessage());
        }
    }

    @Override
    public IntegrationDtos.MailMessageDetailView getMailMessage(String mailbox, String messageId) {
        MailSession session = resolveSession(mailbox);
        long uid = parseUid(messageId);
        try (Store store = session.openStore();
             Folder inbox = openInbox(store)) {
            UIDFolder uidFolder = toUidFolder(inbox);
            Message message = uidFolder.getMessageByUID(uid);
            if (message == null) {
                throw new ApiException(NOT_FOUND, "MAIL_MESSAGE_NOT_FOUND", "Mail message not found");
            }
            return toDetail(uidFolder, message);
        } catch (ApiException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new ApiException(BAD_GATEWAY, "MAIL_READ_FAILED", "Mail read failed: " + ex.getMessage());
        }
    }

    @Override
    public IntegrationDtos.MailMessageSearchView searchMailMessages(
            String mailbox,
            IntegrationDtos.MailMessageSearchRequest request
    ) {
        String query = request == null ? "" : safeTrim(request.query());
        int limit = request == null ? DEFAULT_LIST_LIMIT : Math.max(1, Math.min(request.limit(), 200));
        if (query.isBlank()) {
            return new IntegrationDtos.MailMessageSearchView("", List.of());
        }
        MailSession session = resolveSession(mailbox);
        try (Store store = session.openStore();
             Folder inbox = openInbox(store)) {
            UIDFolder uidFolder = toUidFolder(inbox);
            SearchTerm term = buildSearchTerm(query);
            Message[] hits = inbox.search(term);

            List<IntegrationDtos.MailMessageSummaryView> mapped = new ArrayList<>();
            for (Message message : hits) {
                mapped.add(toSummary(uidFolder, message));
            }
            mapped.sort(Comparator.comparing(IntegrationDtos.MailMessageSummaryView::sentAtIso).reversed());
            if (mapped.size() > limit) {
                mapped = mapped.subList(0, limit);
            }
            return new IntegrationDtos.MailMessageSearchView(query, mapped);
        } catch (ApiException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new ApiException(BAD_GATEWAY, "MAIL_SEARCH_FAILED", "Mail search failed: " + ex.getMessage());
        }
    }

    private MailSession resolveSession(String mailbox) {
        UserEntity user = userRepository.findByEmailIgnoreCase(mailbox)
                .orElseThrow(() -> new ApiException(NOT_FOUND, "MAILBOX_NOT_FOUND", "Mailbox not found"));
        Optional<MailAccountPort.MailAccountRecord> opt = mailAccountPort.findByOwnerId(user.getId());
        if (opt.isEmpty()) {
            throw new ApiException(UNPROCESSABLE_ENTITY, "MAIL_ACCOUNT_NOT_CONFIGURED", "MAIL_ACCOUNT_NOT_CONFIGURED");
        }
        MailAccountPort.MailAccountRecord record = opt.get();
        String host = safeHost(record.imapHost());
        int port = record.imapPort() > 0 ? record.imapPort() : defaultPort;
        if (host.isBlank()) {
            host = safeHost(defaultHost);
        }
        if (host.isBlank()) {
            throw new ApiException(UNPROCESSABLE_ENTITY, "IMAP_HOST_REQUIRED", "IMAP host is required");
        }
        String username = safeTrim(record.imapUsername());
        if (username.isBlank()) {
            username = mailbox;
        }
        String password;
        try {
            password = cryptoService.decryptFromBase64(record.encryptedPassword());
        } catch (Exception ex) {
            throw new ApiException(BAD_GATEWAY, "MAIL_ACCOUNT_DECRYPT_FAILED", "Mail account decrypt failed");
        }
        return new MailSession(host, port, username, password);
    }

    private static String safeHost(String host) {
        return host == null ? "" : host.trim();
    }

    private static String safeTrim(String value) {
        return value == null ? "" : value.trim();
    }

    private static Folder openInbox(Store store) throws MessagingException {
        Folder inbox = store.getFolder("INBOX");
        inbox.open(Folder.READ_ONLY);
        return inbox;
    }

    private static UIDFolder toUidFolder(Folder folder) {
        if (!(folder instanceof UIDFolder uidFolder)) {
            throw new ApiException(BAD_GATEWAY, "IMAP_UID_UNSUPPORTED", "IMAP UID is not supported by provider");
        }
        return uidFolder;
    }

    private static long parseUid(String messageId) {
        try {
            return Long.parseLong(messageId);
        } catch (Exception ex) {
            throw new ApiException(UNPROCESSABLE_ENTITY, "MAIL_MESSAGE_ID_INVALID", "Invalid mail message id");
        }
    }

    private static SearchTerm buildSearchTerm(String query) {
        // Best-effort: subject OR from OR body contains query.
        return new OrTerm(
                new OrTerm(new SubjectTerm(query), new FromStringTerm(query)),
                new BodyTerm(query)
        );
    }

    private IntegrationDtos.MailMessageSummaryView toSummary(UIDFolder uidFolder, Message message) throws Exception {
        String id = Long.toString(uidFolder.getUID(message));
        String from = formatAddresses(message.getFrom());
        String to = formatAddresses(message.getRecipients(Message.RecipientType.TO));
        String subject = message.getSubject() == null ? "" : message.getSubject();
        String body = extractPlainText(message);
        String preview = body.length() > 160 ? body.substring(0, 160) + "…" : body;
        String sentAtIso = toIso(message.getSentDate());
        return new IntegrationDtos.MailMessageSummaryView(id, from, to, subject, preview, sentAtIso);
    }

    private IntegrationDtos.MailMessageDetailView toDetail(UIDFolder uidFolder, Message message) throws Exception {
        String id = Long.toString(uidFolder.getUID(message));
        String from = formatAddresses(message.getFrom());
        String to = formatAddresses(message.getRecipients(Message.RecipientType.TO));
        String subject = message.getSubject() == null ? "" : message.getSubject();
        String body = extractPlainText(message);
        String sentAtIso = toIso(message.getSentDate());
        return new IntegrationDtos.MailMessageDetailView(id, from, to, subject, body, sentAtIso);
    }

    private static String toIso(java.util.Date date) {
        if (date == null) {
            return Instant.EPOCH.toString();
        }
        return date.toInstant().toString();
    }

    private static String formatAddresses(jakarta.mail.Address[] addresses) {
        if (addresses == null || addresses.length == 0) {
            return "";
        }
        List<String> parts = new ArrayList<>(addresses.length);
        for (jakarta.mail.Address address : addresses) {
            if (address instanceof InternetAddress ia) {
                String personal = ia.getPersonal();
                String email = ia.getAddress();
                if (personal != null && !personal.isBlank()) {
                    parts.add(personal + " <" + email + ">");
                } else {
                    parts.add(email);
                }
            } else {
                parts.add(address.toString());
            }
        }
        return String.join(", ", parts);
    }

    private static String extractPlainText(Part part) throws Exception {
        if (part.isMimeType("text/plain")) {
            Object content = part.getContent();
            if (content instanceof String s) {
                return normalizeText(s);
            }
            if (content instanceof byte[] bytes) {
                return normalizeText(new String(bytes, StandardCharsets.UTF_8));
            }
        }
        if (part.isMimeType("text/html")) {
            Object content = part.getContent();
            if (content instanceof String s) {
                return normalizeText(stripHtml(s));
            }
        }
        if (part.isMimeType("multipart/*")) {
            Multipart mp = (Multipart) part.getContent();
            String plain = null;
            String html = null;
            for (int i = 0; i < mp.getCount(); i++) {
                BodyPart bp = mp.getBodyPart(i);
                if (bp.isMimeType("text/plain") && plain == null) {
                    plain = extractPlainText(bp);
                } else if (bp.isMimeType("text/html") && html == null) {
                    html = extractPlainText(bp);
                } else if (bp.getDisposition() == null) {
                    // Inline multipart alternative; recurse.
                    String nested = extractPlainText(bp);
                    if (plain == null && !nested.isBlank()) {
                        plain = nested;
                    }
                }
            }
            if (plain != null && !plain.isBlank()) {
                return plain;
            }
            if (html != null && !html.isBlank()) {
                return html;
            }
        }
        return "";
    }

    private static String stripHtml(String html) {
        String noTags = TAGS.matcher(html).replaceAll(" ");
        return noTags.replace("&nbsp;", " ").replace("&lt;", "<").replace("&gt;", ">").replace("&amp;", "&");
    }

    private static String normalizeText(String text) {
        if (text == null) return "";
        return text.replace("\r\n", "\n").replace('\r', '\n').trim();
    }

    private record MailSession(String host, int port, String username, String password) {
        Store openStore() throws MessagingException {
            Properties props = new Properties();
            props.put("mail.store.protocol", "imaps");
            props.put("mail.imaps.host", host);
            props.put("mail.imaps.port", Integer.toString(port));
            props.put("mail.imaps.ssl.enable", "true");
            Session mailSession = Session.getInstance(props);
            Store store = mailSession.getStore("imaps");
            store.connect(host, port, username, password);
            return store;
        }
    }
}

