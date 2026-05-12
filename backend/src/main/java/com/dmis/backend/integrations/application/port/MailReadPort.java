package com.dmis.backend.integrations.application.port;

import com.dmis.backend.integrations.application.dto.IntegrationDtos;
import com.dmis.backend.integrations.domain.model.MailFolder;

import java.util.List;

public interface MailReadPort {
    List<IntegrationDtos.MailMessageSummaryView> listMailMessages(String mailbox, MailFolder folder);

    IntegrationDtos.MailMessageDetailView getMailMessage(String mailbox, String messageId);

    IntegrationDtos.MailMessageSearchView searchMailMessages(String mailbox, IntegrationDtos.MailMessageSearchRequest request);

    /** Сырые байты части MIME / вложения Mailpit. */
    byte[] downloadAttachmentPart(String mailbox, String messageId, String partId);
}
