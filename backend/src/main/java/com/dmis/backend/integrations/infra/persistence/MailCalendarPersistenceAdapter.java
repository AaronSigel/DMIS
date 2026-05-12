package com.dmis.backend.integrations.infra.persistence;

import com.dmis.backend.integrations.application.dto.IntegrationDtos;
import com.dmis.backend.integrations.application.port.MailCalendarPort;
import com.dmis.backend.integrations.infra.persistence.entity.CalendarDraftEntity;
import com.dmis.backend.integrations.infra.persistence.entity.MailDraftEntity;
import com.dmis.backend.integrations.infra.persistence.repository.CalendarDraftJpaRepository;
import com.dmis.backend.integrations.infra.persistence.repository.MailDraftJpaRepository;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class MailCalendarPersistenceAdapter implements MailCalendarPort {
    private final MailDraftJpaRepository mailDraftJpaRepository;
    private final CalendarDraftJpaRepository calendarDraftJpaRepository;

    public MailCalendarPersistenceAdapter(MailDraftJpaRepository mailDraftJpaRepository, CalendarDraftJpaRepository calendarDraftJpaRepository) {
        this.mailDraftJpaRepository = mailDraftJpaRepository;
        this.calendarDraftJpaRepository = calendarDraftJpaRepository;
    }

    @Override
    public IntegrationDtos.MailDraftView saveMailDraft(IntegrationDtos.MailDraftView draftView) {
        mailDraftJpaRepository.save(new MailDraftEntity(
                draftView.id(),
                draftView.to(),
                draftView.subject(),
                draftView.body(),
                draftView.createdBy()
        ));
        return draftView;
    }

    @Override
    public IntegrationDtos.CalendarDraftView saveCalendarDraft(IntegrationDtos.CalendarDraftView draftView) {
        calendarDraftJpaRepository.save(new CalendarDraftEntity(
                draftView.id(),
                draftView.title(),
                String.join(",", draftView.attendees()),
                draftView.startIso(),
                draftView.endIso(),
                draftView.createdBy()
        ));
        return new IntegrationDtos.CalendarDraftView(
                draftView.id(),
                draftView.title(),
                List.copyOf(draftView.attendees()),
                draftView.startIso(),
                draftView.endIso(),
                draftView.createdBy()
        );
    }

    @Override
    public IntegrationDtos.MailDraftView sendMailDraft(
            IntegrationDtos.MailDraftView draft,
            String idempotencyKey,
            List<IntegrationDtos.MailAttachment> attachments,
            String senderAddress
    ) {
        return draft;
    }

    @Override
    public IntegrationDtos.CalendarDraftView sendCalendarDraft(IntegrationDtos.CalendarDraftView draft, String idempotencyKey) {
        return draft;
    }

    @Override
    public IntegrationDtos.FreeBusyView getFreeBusy(String attendee, String startIso, String endIso) {
        return new IntegrationDtos.FreeBusyView(attendee, List.of());
    }
}
