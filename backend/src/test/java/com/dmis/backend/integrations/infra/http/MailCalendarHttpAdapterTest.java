package com.dmis.backend.integrations.infra.http;

import com.dmis.backend.integrations.application.dto.IntegrationDtos;
import com.dmis.backend.integrations.infra.persistence.MailCalendarPersistenceAdapter;
import jakarta.mail.Message;
import jakarta.mail.Session;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import jakarta.mail.internet.MimeMultipart;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.http.HttpStatus;
import org.springframework.mail.MailSendException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.web.server.ResponseStatusException;

import java.net.UnknownHostException;
import java.util.List;
import java.util.Properties;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
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

    @Test
    void sendMailDraft_throwsWhenSmtpNotConfigured() {
        @SuppressWarnings("unchecked")
        ObjectProvider<JavaMailSender> provider = mock(ObjectProvider.class);
        when(provider.getIfAvailable()).thenReturn(null);

        MailCalendarHttpAdapter adapter = createAdapter(provider);

        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> adapter.sendMailDraft(DRAFT, "key-1", List.of())
        );
        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, ex.getStatusCode());
    }

    @Test
    void throwsServiceUnavailableWhenMailFromBlank() {
        @SuppressWarnings("unchecked")
        ObjectProvider<JavaMailSender> provider = mock(ObjectProvider.class);
        JavaMailSender sender = mock(JavaMailSender.class);
        when(provider.getIfAvailable()).thenReturn(sender);

        MailCalendarHttpAdapter adapter = new MailCalendarHttpAdapter(
                mock(MailCalendarPersistenceAdapter.class), provider, ""
        );

        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> adapter.sendMailDraft(DRAFT, "key-1", List.of())
        );
        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, ex.getStatusCode());
        verify(sender, never()).send(any(MimeMessage.class));
    }

    @Test
    void sendsMimeMultipartWhenConfigured() throws Exception {
        @SuppressWarnings("unchecked")
        ObjectProvider<JavaMailSender> provider = mock(ObjectProvider.class);
        JavaMailSender sender = mock(JavaMailSender.class);
        when(provider.getIfAvailable()).thenReturn(sender);
        when(sender.createMimeMessage()).thenAnswer(invocation -> new MimeMessage(Session.getInstance(new Properties())));

        MailCalendarHttpAdapter adapter = createAdapter(provider);
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

        MailCalendarHttpAdapter adapter = createAdapter(provider);
        adapter.sendMailDraft(DRAFT, "key-1", List.of(), "sokolov-d-a@example.com");

        ArgumentCaptor<MimeMessage> captor = ArgumentCaptor.forClass(MimeMessage.class);
        verify(sender).send(captor.capture());
        MimeMessage sent = captor.getValue();
        assertEquals("sokolov-d-a@example.com", ((InternetAddress) sent.getFrom()[0]).getAddress());
        assertEquals("<key-1@example.com>", sent.getHeader("Message-ID")[0]);
    }

    @Test
    void sendMailDraft_stripsInvisibleCharsFromRecipient() throws Exception {
        @SuppressWarnings("unchecked")
        ObjectProvider<JavaMailSender> provider = mock(ObjectProvider.class);
        JavaMailSender sender = mock(JavaMailSender.class);
        when(provider.getIfAvailable()).thenReturn(sender);
        when(sender.createMimeMessage()).thenAnswer(invocation -> new MimeMessage(Session.getInstance(new Properties())));

        MailCalendarHttpAdapter adapter = createAdapter(provider);
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

        MailCalendarHttpAdapter adapter = createAdapter(provider);
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

        MailCalendarHttpAdapter adapter = createAdapter(provider);
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

        MailCalendarHttpAdapter adapter = createAdapter(provider);
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
                "user@"
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

        MailCalendarHttpAdapter adapter = createAdapter(provider);
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

        MailCalendarHttpAdapter adapter = createAdapter(provider);
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

        MailCalendarHttpAdapter adapter = createAdapter(provider);
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

        MailCalendarHttpAdapter adapter = createAdapter(provider);
        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> adapter.sendMailDraft(DRAFT, "key-1", List.of())
        );
        assertEquals(HttpStatus.BAD_GATEWAY, ex.getStatusCode());
        assertTrue(ex.getReason() != null && ex.getReason().contains("SMTP отклонил"));
        assertTrue(ex.getReason().contains("553"));
    }

    private static MailCalendarHttpAdapter createAdapter(
            ObjectProvider<JavaMailSender> mailSenderProvider
    ) {
        return new MailCalendarHttpAdapter(
                mock(MailCalendarPersistenceAdapter.class),
                mailSenderProvider,
                "no-reply@example.com"
        );
    }

}
