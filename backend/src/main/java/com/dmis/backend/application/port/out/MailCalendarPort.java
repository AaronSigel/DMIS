package com.dmis.backend.integrations.application.port;

import com.dmis.backend.integrations.application.dto.IntegrationDtos;

public interface MailCalendarPort {
    IntegrationDtos.MailDraftView saveMailDraft(IntegrationDtos.MailDraftView draftView);

    IntegrationDtos.CalendarDraftView saveCalendarDraft(IntegrationDtos.CalendarDraftView draftView);
}
