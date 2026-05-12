package com.dmis.backend.integrations.infra.http;

import com.dmis.backend.integrations.application.dto.IntegrationDtos;
import com.dmis.backend.integrations.infra.persistence.MailCalendarPersistenceAdapter;
import com.sun.net.httpserver.HttpServer;
import jakarta.mail.Message;
import jakarta.mail.Session;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import jakarta.mail.internet.MimeMultipart;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.http.HttpStatus;
import org.springframework.mail.MailSendException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.web.server.ResponseStatusException;

import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.UnknownHostException;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.List;
import java.util.Properties;
import java.util.concurrent.atomic.AtomicReference;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.fail;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class MailCalendarHttpAdapterTest {

    private static final IntegrationDtos.MailDraftView DRAFT = new IntegrationDtos.MailDraftView(
            "mail-1", "to@example.com", "Subject", "Body text", "actor-1"
    );

    private HttpServer server;

    @AfterEach
    void tearDown() {
        if (server != null) {
            server.stop(0);
        }
    }

    @Test
    void sendCalendarDraft_returnsDraftWithoutRemoteCallWhenCaldavConfigMissing() {
        MailCalendarHttpAdapter adapter = createAdapter(new EmptyObjectProvider<>(), "", "", "", "");
        IntegrationDtos.CalendarDraftView draft = calendarDraft();

        IntegrationDtos.CalendarDraftView result = adapter.sendCalendarDraft(draft, "idem-1");

        assertEquals(draft, result);
    }

    @Test
    void sendCalendarDraft_sendsIcsWithBasicAuth() throws Exception {
        AtomicReference<String> authHeader = new AtomicReference<>();
        AtomicReference<String> contentTypeHeader = new AtomicReference<>();
        AtomicReference<String> requestMethod = new AtomicReference<>();
        AtomicReference<String> requestPath = new AtomicReference<>();
        AtomicReference<String> requestBody = new AtomicReference<>();

        server = HttpServer.create(new InetSocketAddress(0), 0);
        server.createContext("/calendar", exchange -> {
            authHeader.set(exchange.getRequestHeaders().getFirst("Authorization"));
            contentTypeHeader.set(exchange.getRequestHeaders().getFirst("Content-Type"));
            requestMethod.set(exchange.getRequestMethod());
            requestPath.set(exchange.getRequestURI().getPath());
            requestBody.set(new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8));
            exchange.sendResponseHeaders(201, -1);
            exchange.close();
        });
        server.start();

        String baseUrl = "http://127.0.0.1:" + server.getAddress().getPort();
        MailCalendarHttpAdapter adapter = createAdapter(
                new EmptyObjectProvider<>(),
                baseUrl,
                "alex",
                "secret",
                "/calendar"
        );

        IntegrationDtos.CalendarDraftView result = adapter.sendCalendarDraft(calendarDraft(), "action:123");

        assertEquals(calendarDraft(), result);
        assertEquals("PUT", requestMethod.get());
        assertTrue(requestPath.get().startsWith("/calendar/"));
        assertTrue(requestPath.get().endsWith(".ics"));
        String expectedAuth = "Basic " + Base64.getEncoder()
                .encodeToString("alex:secret".getBytes(StandardCharsets.UTF_8));
        assertEquals(expectedAuth, authHeader.get());
        assertTrue(contentTypeHeader.get().startsWith("text/calendar"));
        assertTrue(requestBody.get().contains("BEGIN:VCALENDAR"));
        assertTrue(requestBody.get().contains("BEGIN:VEVENT"));
        assertTrue(requestBody.get().contains("SUMMARY:Demo event"));
        assertTrue(requestBody.get().contains("ATTENDEE"));
    }

    @Test
    void sendCalendarDraft_throwsBadGatewayWhenRemoteFails() throws Exception {
        server = HttpServer.create(new InetSocketAddress(0), 0);
        server.createContext("/calendar", exchange -> {
            byte[] body = "failed".getBytes(StandardCharsets.UTF_8);
            exchange.sendResponseHeaders(500, body.length);
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(body);
            }
        });
        server.start();

        String baseUrl = "http://127.0.0.1:" + server.getAddress().getPort();
        MailCalendarHttpAdapter adapter = createAdapter(
                new EmptyObjectProvider<>(),
                baseUrl,
                "alex",
                "secret",
                "/calendar"
        );

        try {
            adapter.sendCalendarDraft(calendarDraft(), "idem-fail");
            fail("Expected ResponseStatusException");
        } catch (ResponseStatusException ex) {
            assertEquals(502, ex.getStatusCode().value());
        }
    }

    @Test
    void noopWhenMailSenderUnavailable() {
        @SuppressWarnings("unchecked")
        ObjectProvider<JavaMailSender> provider = mock(ObjectProvider.class);
        when(provider.getIfAvailable()).thenReturn(null);

        MailCalendarHttpAdapter adapter = createAdapter(provider, "", "", "", "");

        IntegrationDtos.MailDraftView result = adapter.sendMailDraft(DRAFT, "key-1", List.of());
        assertSame(DRAFT, result);
    }

    @Test
    void noopWhenMailFromBlank() {
        @SuppressWarnings("unchecked")
        ObjectProvider<JavaMailSender> provider = mock(ObjectProvider.class);
        JavaMailSender sender = mock(JavaMailSender.class);
        when(provider.getIfAvailable()).thenReturn(sender);

        MailCalendarHttpAdapter adapter = new MailCalendarHttpAdapter(
                mock(MailCalendarPersistenceAdapter.class), provider, "", "", "", "", ""
        );

        IntegrationDtos.MailDraftView result = adapter.sendMailDraft(DRAFT, "key-1", List.of());
        assertSame(DRAFT, result);
        verify(sender, never()).send(any(MimeMessage.class));
    }

    @Test
    void sendsMimeMultipartWhenConfigured() throws Exception {
        @SuppressWarnings("unchecked")
        ObjectProvider<JavaMailSender> provider = mock(ObjectProvider.class);
        JavaMailSender sender = mock(JavaMailSender.class);
        when(provider.getIfAvailable()).thenReturn(sender);
        when(sender.createMimeMessage()).thenAnswer(invocation -> new MimeMessage(Session.getInstance(new Properties())));

        MailCalendarHttpAdapter adapter = createAdapter(provider, "", "", "", "");
        IntegrationDtos.MailDraftView result = adapter.sendMailDraft(DRAFT, "key-1", List.of());

        ArgumentCaptor<MimeMessage> captor = ArgumentCaptor.forClass(MimeMessage.class);
        verify(sender).send(captor.capture());

        MimeMessage sent = captor.getValue();
        assertTrue(sent.getContent() instanceof MimeMultipart);
        assertEquals("<key-1@example.com>", sent.getHeader("Message-ID")[0]);
        assertEquals("key-1", sent.getHeader("X-Idempotency-Key")[0]);
        assertSame(DRAFT, result);
    }

    @Test
    void sendMailDraft_usesExplicitSenderAddressForFromHeader() throws Exception {
        @SuppressWarnings("unchecked")
        ObjectProvider<JavaMailSender> provider = mock(ObjectProvider.class);
        JavaMailSender sender = mock(JavaMailSender.class);
        when(provider.getIfAvailable()).thenReturn(sender);
        when(sender.createMimeMessage()).thenAnswer(invocation -> new MimeMessage(Session.getInstance(new Properties())));

        MailCalendarHttpAdapter adapter = createAdapter(provider, "", "", "", "");
        adapter.sendMailDraft(DRAFT, "key-1", List.of(), "admin@example.com");

        ArgumentCaptor<MimeMessage> captor = ArgumentCaptor.forClass(MimeMessage.class);
        verify(sender).send(captor.capture());
        MimeMessage sent = captor.getValue();
        assertEquals("admin@example.com", ((InternetAddress) sent.getFrom()[0]).getAddress());
        assertEquals("<key-1@example.com>", sent.getHeader("Message-ID")[0]);
    }

    @Test
    void sendMailDraft_stripsInvisibleCharsFromRecipient() throws Exception {
        @SuppressWarnings("unchecked")
        ObjectProvider<JavaMailSender> provider = mock(ObjectProvider.class);
        JavaMailSender sender = mock(JavaMailSender.class);
        when(provider.getIfAvailable()).thenReturn(sender);
        when(sender.createMimeMessage()).thenAnswer(invocation -> new MimeMessage(Session.getInstance(new Properties())));

        MailCalendarHttpAdapter adapter = createAdapter(provider, "", "", "", "");
        IntegrationDtos.MailDraftView draftWithZwsp = new IntegrationDtos.MailDraftView(
                "mail-1", "you\u200B@example.com", "Subject", "Body", "actor-1"
        );
        adapter.sendMailDraft(draftWithZwsp, "key-1", List.of());

        ArgumentCaptor<MimeMessage> captor = ArgumentCaptor.forClass(MimeMessage.class);
        verify(sender).send(captor.capture());
        MimeMessage sent = captor.getValue();
        assertNotNull(sent.getRecipients(Message.RecipientType.TO));
        assertEquals(1, sent.getRecipients(Message.RecipientType.TO).length);
        assertEquals(
                "you@example.com",
                ((InternetAddress) sent.getRecipients(Message.RecipientType.TO)[0]).getAddress()
        );
    }

    @Test
    void doesNotSetIdempotencyHeadersWhenKeyBlank() throws Exception {
        @SuppressWarnings("unchecked")
        ObjectProvider<JavaMailSender> provider = mock(ObjectProvider.class);
        JavaMailSender sender = mock(JavaMailSender.class);
        when(provider.getIfAvailable()).thenReturn(sender);
        when(sender.createMimeMessage()).thenAnswer(invocation -> new MimeMessage(Session.getInstance(new Properties())));

        MailCalendarHttpAdapter adapter = createAdapter(provider, "", "", "", "");
        adapter.sendMailDraft(DRAFT, "", List.of());

        ArgumentCaptor<MimeMessage> captor = ArgumentCaptor.forClass(MimeMessage.class);
        verify(sender).send(captor.capture());
        assertNull(captor.getValue().getHeader("X-Idempotency-Key"));
    }

    @Test
    void sendsMimeMultipartWithAttachments() throws Exception {
        @SuppressWarnings("unchecked")
        ObjectProvider<JavaMailSender> provider = mock(ObjectProvider.class);
        JavaMailSender sender = mock(JavaMailSender.class);
        when(provider.getIfAvailable()).thenReturn(sender);
        when(sender.createMimeMessage()).thenAnswer(invocation -> new MimeMessage(Session.getInstance(new Properties())));

        MailCalendarHttpAdapter adapter = createAdapter(provider, "", "", "", "");
        List<IntegrationDtos.MailAttachment> attachments = List.of(
                new IntegrationDtos.MailAttachment("doc.pdf", "application/pdf", new byte[]{1, 2, 3})
        );
        adapter.sendMailDraft(DRAFT, "key-1", attachments);

        ArgumentCaptor<MimeMessage> captor = ArgumentCaptor.forClass(MimeMessage.class);
        verify(sender).send(captor.capture());
        MimeMultipart multipart = (MimeMultipart) captor.getValue().getContent();
        assertTrue(multipart.getCount() >= 2);
    }

    @Test
    void mapsMailExceptionToBadGateway() {
        @SuppressWarnings("unchecked")
        ObjectProvider<JavaMailSender> provider = mock(ObjectProvider.class);
        JavaMailSender sender = mock(JavaMailSender.class);
        when(provider.getIfAvailable()).thenReturn(sender);
        when(sender.createMimeMessage()).thenAnswer(invocation -> new MimeMessage(Session.getInstance(new Properties())));
        doThrow(new MailSendException("smtp down")).when(sender).send(any(MimeMessage.class));

        MailCalendarHttpAdapter adapter = createAdapter(provider, "", "", "", "");
        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> adapter.sendMailDraft(DRAFT, "key-1", List.of())
        );
        assertEquals(HttpStatus.BAD_GATEWAY, ex.getStatusCode());
    }

    @Test
    void sendMailDraft_badRequestWhenMailFromInvalid() {
        @SuppressWarnings("unchecked")
        ObjectProvider<JavaMailSender> provider = mock(ObjectProvider.class);
        JavaMailSender sender = mock(JavaMailSender.class);
        when(provider.getIfAvailable()).thenReturn(sender);

        MailCalendarHttpAdapter adapter = new MailCalendarHttpAdapter(
                mock(MailCalendarPersistenceAdapter.class),
                provider,
                "user@",
                "",
                "",
                "",
                ""
        );
        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> adapter.sendMailDraft(DRAFT, "key-1", List.of())
        );
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        verify(sender, never()).send(any(MimeMessage.class));
    }

    @Test
    void sendMailDraft_badRequestWhenRecipientInvalid() {
        @SuppressWarnings("unchecked")
        ObjectProvider<JavaMailSender> provider = mock(ObjectProvider.class);
        JavaMailSender sender = mock(JavaMailSender.class);
        when(provider.getIfAvailable()).thenReturn(sender);

        MailCalendarHttpAdapter adapter = createAdapter(provider, "", "", "", "");
        IntegrationDtos.MailDraftView badTo = new IntegrationDtos.MailDraftView(
                "mail-1", "recipient@", "Subject", "Body", "actor-1"
        );
        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> adapter.sendMailDraft(badTo, "key-1", List.of())
        );
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        verify(sender, never()).send(any(MimeMessage.class));
    }

    @Test
    void sendMailDraft_badRequestWhenRecipientUsesDotlessOrDockerLikeDomain() {
        @SuppressWarnings("unchecked")
        ObjectProvider<JavaMailSender> provider = mock(ObjectProvider.class);
        JavaMailSender sender = mock(JavaMailSender.class);
        when(provider.getIfAvailable()).thenReturn(sender);

        MailCalendarHttpAdapter adapter = createAdapter(provider, "", "", "", "");
        IntegrationDtos.MailDraftView badTo = new IntegrationDtos.MailDraftView(
                "mail-1", "user@mailpit", "Subject", "Body", "actor-1"
        );
        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> adapter.sendMailDraft(badTo, "key-1", List.of())
        );
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        assertTrue(ex.getReason() != null && ex.getReason().contains("RFC 5321"));
        verify(sender, never()).send(any(MimeMessage.class));
    }

    @Test
    void mapsUnknownHostExceptionCauseToReadableSmtpHint() {
        @SuppressWarnings("unchecked")
        ObjectProvider<JavaMailSender> provider = mock(ObjectProvider.class);
        JavaMailSender sender = mock(JavaMailSender.class);
        when(provider.getIfAvailable()).thenReturn(sender);
        when(sender.createMimeMessage()).thenAnswer(invocation -> new MimeMessage(Session.getInstance(new Properties())));
        doThrow(new MailSendException("send failed", new UnknownHostException("unknown-smtp-host")))
                .when(sender).send(any(MimeMessage.class));

        MailCalendarHttpAdapter adapter = createAdapter(provider, "", "", "", "");
        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> adapter.sendMailDraft(DRAFT, "key-1", List.of())
        );
        assertEquals(HttpStatus.BAD_GATEWAY, ex.getStatusCode());
        assertTrue(ex.getReason() != null && ex.getReason().contains("SMTP_HOST"));
        assertTrue(ex.getReason().contains("unknown-smtp-host"));
    }

    @Test
    void mapsSendFailedExceptionToReadableDetail() throws Exception {
        @SuppressWarnings("unchecked")
        ObjectProvider<JavaMailSender> provider = mock(ObjectProvider.class);
        JavaMailSender sender = mock(JavaMailSender.class);
        when(provider.getIfAvailable()).thenReturn(sender);
        when(sender.createMimeMessage()).thenAnswer(invocation -> new MimeMessage(Session.getInstance(new Properties())));
        doThrow(new MailSendException("send failed", new jakarta.mail.SendFailedException("553 5.1.3 rejected")))
                .when(sender).send(any(MimeMessage.class));

        MailCalendarHttpAdapter adapter = createAdapter(provider, "", "", "", "");
        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> adapter.sendMailDraft(DRAFT, "key-1", List.of())
        );
        assertEquals(HttpStatus.BAD_GATEWAY, ex.getStatusCode());
        assertTrue(ex.getReason() != null && ex.getReason().contains("SMTP отклонил"));
        assertTrue(ex.getReason().contains("553"));
    }

    @Test
    void getFreeBusy_readsBusySlotsFromCaldavPayload() throws Exception {
        server = HttpServer.create(new InetSocketAddress(0), 0);
        server.createContext("/calendar/", exchange -> {
            String payload = """
                    BEGIN:VCALENDAR
                    VERSION:2.0
                    BEGIN:VEVENT
                    DTSTART:20260508T081500Z
                    DTEND:20260508T091500Z
                    ATTENDEE:mailto:a@example.com
                    END:VEVENT
                    BEGIN:VEVENT
                    DTSTART:20260508T120000Z
                    DTEND:20260508T130000Z
                    ATTENDEE:mailto:other@example.com
                    END:VEVENT
                    END:VCALENDAR
                    """;
            byte[] body = payload.getBytes(StandardCharsets.UTF_8);
            exchange.sendResponseHeaders(200, body.length);
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(body);
            }
        });
        server.start();

        String baseUrl = "http://127.0.0.1:" + server.getAddress().getPort();
        MailCalendarHttpAdapter adapter = createAdapter(
                new EmptyObjectProvider<>(),
                baseUrl,
                "",
                "",
                "/calendar/"
        );

        IntegrationDtos.FreeBusyView result = adapter.getFreeBusy(
                "a@example.com",
                "2026-05-08T08:00:00Z",
                "2026-05-08T10:00:00Z"
        );
        assertEquals(1, result.busySlots().size());
        assertEquals("2026-05-08T08:15:00Z", result.busySlots().get(0).startIso());
        assertEquals("2026-05-08T09:15:00Z", result.busySlots().get(0).endIso());
    }

    private static MailCalendarHttpAdapter createAdapter(
            ObjectProvider<JavaMailSender> mailSenderProvider,
            String caldavBaseUrl,
            String username,
            String password,
            String calendarPath
    ) {
        return new MailCalendarHttpAdapter(
                mock(MailCalendarPersistenceAdapter.class),
                mailSenderProvider,
                "no-reply@example.com",
                caldavBaseUrl,
                username,
                password,
                calendarPath
        );
    }


    private static IntegrationDtos.CalendarDraftView calendarDraft() {
        return new IntegrationDtos.CalendarDraftView(
                "event-1",
                "Demo event",
                List.of("a@example.com", "b@example.com"),
                "2026-05-08T08:00:00Z",
                "2026-05-08T09:00:00Z",
                "user-1"
        );
    }

    private static final class EmptyObjectProvider<T> implements ObjectProvider<T> {
        @Override
        public T getObject() {
            return null;
        }

        @Override
        public T getObject(Object... args) {
            return null;
        }

        @Override
        public T getIfAvailable() {
            return null;
        }

        @Override
        public T getIfUnique() {
            return null;
        }
    }
}
