package com.dmis.backend.integrations.application.port;

import com.dmis.backend.integrations.application.dto.IntegrationDtos;

import java.util.List;

public interface MailCalendarPort {
    IntegrationDtos.MailDraftView saveMailDraft(IntegrationDtos.MailDraftView draftView);

    IntegrationDtos.CalendarDraftView saveCalendarDraft(IntegrationDtos.CalendarDraftView draftView);

    default IntegrationDtos.MailDraftView sendMailDraft(
            IntegrationDtos.MailDraftView draft,
            String idempotencyKey,
            List<IntegrationDtos.MailAttachment> attachments
    ) {
        return sendMailDraft(draft, idempotencyKey, attachments, null);
    }

    IntegrationDtos.MailDraftView sendMailDraft(
            IntegrationDtos.MailDraftView draft,
            String idempotencyKey,
            List<IntegrationDtos.MailAttachment> attachments,
            String senderAddress
    );

    IntegrationDtos.CalendarDraftView sendCalendarDraft(IntegrationDtos.CalendarDraftView draft, String idempotencyKey);

    IntegrationDtos.FreeBusyView getFreeBusy(String attendee, String startIso, String endIso);
}
