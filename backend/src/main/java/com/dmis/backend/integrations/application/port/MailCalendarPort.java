package com.dmis.backend.integrations.application.port;

import com.dmis.backend.integrations.application.dto.IntegrationDtos;

public interface MailCalendarPort {
    IntegrationDtos.MailDraftView saveMailDraft(IntegrationDtos.MailDraftView draftView);

    IntegrationDtos.CalendarDraftView saveCalendarDraft(IntegrationDtos.CalendarDraftView draftView);

    IntegrationDtos.MailDraftView sendMailDraft(IntegrationDtos.MailDraftView draft);

    IntegrationDtos.CalendarDraftView sendCalendarDraft(IntegrationDtos.CalendarDraftView draft);

    IntegrationDtos.FreeBusyView getFreeBusy(String attendee, String startIso, String endIso);
}
