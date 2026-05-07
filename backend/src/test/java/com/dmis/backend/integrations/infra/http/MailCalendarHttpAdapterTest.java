package com.dmis.backend.integrations.infra.http;

import com.dmis.backend.integrations.application.dto.IntegrationDtos;
import com.dmis.backend.integrations.infra.persistence.MailCalendarPersistenceAdapter;
import com.sun.net.httpserver.HttpServer;
import jakarta.mail.Session;
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
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.List;
import java.util.Properties;
import java.util.concurrent.atomic.AtomicReference;

import static org.junit.jupiter.api.Assertions.assertEquals;
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
        server.createContext("/SOGo/dav/alex/Calendar/personal", exchange -> {
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
                "/SOGo/dav/alex/Calendar/personal"
        );

        IntegrationDtos.CalendarDraftView result = adapter.sendCalendarDraft(calendarDraft(), "action:123");

        assertEquals(calendarDraft(), result);
        assertEquals("PUT", requestMethod.get());
        assertTrue(requestPath.get().startsWith("/SOGo/dav/alex/Calendar/personal/"));
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
        server.createContext("/SOGo/dav/alex/Calendar/personal", exchange -> {
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
                "/SOGo/dav/alex/Calendar/personal"
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
                mock(MailCalendarPersistenceAdapter.class), provider, "", "", "", "", "", ""
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
        assertEquals("<key-1@dmis.test.local>", sent.getHeader("Message-ID")[0]);
        assertEquals("key-1", sent.getHeader("X-Idempotency-Key")[0]);
        assertSame(DRAFT, result);
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
                "no-reply@dmis.test.local",
                "",
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
