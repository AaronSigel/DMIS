package com.dmis.backend.integrations.infra.mail;

import com.dmis.backend.integrations.application.dto.IntegrationDtos;
import com.dmis.backend.integrations.application.port.MailAccountPort;
import com.dmis.backend.platform.crypto.AesGcmCryptoService;
import com.dmis.backend.platform.error.ApiException;
import com.dmis.backend.users.infra.persistence.entity.UserEntity;
import com.dmis.backend.users.infra.persistence.repository.UserJpaRepository;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class ImapMailReadAdapterTest {
    @Test
    void listMailMessages_throwsMailboxNotFound_whenUserMissing() {
        UserJpaRepository users = mock(UserJpaRepository.class);
        MailAccountPort accounts = mock(MailAccountPort.class);
        AesGcmCryptoService crypto = mock(AesGcmCryptoService.class);
        when(users.findByEmailIgnoreCase("missing@example.com")).thenReturn(Optional.empty());

        ImapMailReadAdapter adapter = new ImapMailReadAdapter(users, accounts, crypto, "imap.local", 993);

        ApiException ex = assertThrows(ApiException.class, () -> adapter.listMailMessages("missing@example.com"));
        assertEquals("MAILBOX_NOT_FOUND", ex.errorCode());
    }

    @Test
    void listMailMessages_throwsNotConfigured_whenAccountMissing() {
        UserJpaRepository users = mock(UserJpaRepository.class);
        MailAccountPort accounts = mock(MailAccountPort.class);
        AesGcmCryptoService crypto = mock(AesGcmCryptoService.class);
        when(users.findByEmailIgnoreCase("user@example.com")).thenReturn(Optional.of(
                new UserEntity("u-1", "user@example.com", "User", "hash", Set.of())
        ));
        when(accounts.findByOwnerId("u-1")).thenReturn(Optional.empty());

        ImapMailReadAdapter adapter = new ImapMailReadAdapter(users, accounts, crypto, "imap.local", 993);

        ApiException ex = assertThrows(ApiException.class, () -> adapter.listMailMessages("user@example.com"));
        assertEquals("MAIL_ACCOUNT_NOT_CONFIGURED", ex.errorCode());
    }

    @Test
    void getMailMessage_throwsInvalidId_whenMessageIdNotUid() {
        UserJpaRepository users = mock(UserJpaRepository.class);
        MailAccountPort accounts = mock(MailAccountPort.class);
        AesGcmCryptoService crypto = mock(AesGcmCryptoService.class);
        when(users.findByEmailIgnoreCase("user@example.com")).thenReturn(Optional.of(
                new UserEntity("u-1", "user@example.com", "User", "hash", Set.of())
        ));
        when(accounts.findByOwnerId("u-1")).thenReturn(Optional.of(new MailAccountPort.MailAccountRecord(
                "u-1",
                "imap.local",
                993,
                "user@example.com",
                "enc",
                Instant.now()
        )));
        when(crypto.decryptFromBase64("enc")).thenReturn("secret");

        ImapMailReadAdapter adapter = new ImapMailReadAdapter(users, accounts, crypto, "imap.local", 993);

        ApiException ex = assertThrows(ApiException.class, () -> adapter.getMailMessage("user@example.com", "not-a-uid"));
        assertEquals("MAIL_MESSAGE_ID_INVALID", ex.errorCode());
    }

    @Test
    void searchMailMessages_returnsEmpty_whenQueryBlank() {
        UserJpaRepository users = mock(UserJpaRepository.class);
        MailAccountPort accounts = mock(MailAccountPort.class);
        AesGcmCryptoService crypto = mock(AesGcmCryptoService.class);

        ImapMailReadAdapter adapter = new ImapMailReadAdapter(users, accounts, crypto, "imap.local", 993);
        IntegrationDtos.MailMessageSearchView result = adapter.searchMailMessages(
                "user@example.com",
                new IntegrationDtos.MailMessageSearchRequest("   ", 10)
        );
        assertEquals("", result.query());
        assertEquals(0, result.messages().size());
    }
}

