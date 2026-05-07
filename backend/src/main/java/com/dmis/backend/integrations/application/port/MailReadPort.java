package com.dmis.backend.integrations.application.port;

import com.dmis.backend.integrations.application.dto.IntegrationDtos;

import java.util.List;

public interface MailReadPort {
    List<IntegrationDtos.MailMessageSummaryView> listMailMessages(String mailbox);

    IntegrationDtos.MailMessageDetailView getMailMessage(String mailbox, String messageId);

    IntegrationDtos.MailMessageSearchView searchMailMessages(String mailbox, IntegrationDtos.MailMessageSearchRequest request);
}
