package com.dmis.backend.integrations.infra.mail;

import com.dmis.backend.integrations.application.dto.IntegrationDtos;
import com.dmis.backend.platform.error.ApiException;
import org.junit.jupiter.api.Test;
import org.springframework.web.client.RestClient;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class ImapMailReadAdapterTest {
    @Test
    void listMailMessages_throwsMailboxNotFound_whenMailboxBlank() {
        ImapMailReadAdapter adapter = new ImapMailReadAdapter(RestClient.builder(), "http://localhost:8025");
        ApiException ex = assertThrows(ApiException.class, () -> adapter.listMailMessages("  "));
        assertEquals("MAILBOX_NOT_FOUND", ex.errorCode());
    }

    @Test
    void getMailMessage_throwsInvalidId_whenMessageIdBlank() {
        ImapMailReadAdapter adapter = new ImapMailReadAdapter(RestClient.builder(), "http://localhost:8025");
        ApiException ex = assertThrows(ApiException.class, () -> adapter.getMailMessage("user@example.com", " "));
        assertEquals("MAIL_MESSAGE_ID_INVALID", ex.errorCode());
    }

    @Test
    void searchMailMessages_returnsEmpty_whenQueryBlank() {
        ImapMailReadAdapter adapter = new ImapMailReadAdapter(RestClient.builder(), "http://localhost:8025");
        IntegrationDtos.MailMessageSearchView result = adapter.searchMailMessages(
                "user@example.com",
                new IntegrationDtos.MailMessageSearchRequest("   ", 10)
        );
        assertEquals("", result.query());
        assertEquals(0, result.messages().size());
    }
}

