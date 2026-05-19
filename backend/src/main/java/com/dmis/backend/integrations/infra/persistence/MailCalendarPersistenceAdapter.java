package com.dmis.backend.integrations.infra.persistence;

import com.dmis.backend.integrations.application.dto.IntegrationDtos;
import com.dmis.backend.integrations.application.port.MailCalendarPort;
import com.dmis.backend.integrations.infra.persistence.entity.MailDraftEntity;
import com.dmis.backend.integrations.infra.persistence.repository.MailDraftJpaRepository;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class MailCalendarPersistenceAdapter implements MailCalendarPort {
    private final MailDraftJpaRepository mailDraftJpaRepository;

    public MailCalendarPersistenceAdapter(MailDraftJpaRepository mailDraftJpaRepository) {
        this.mailDraftJpaRepository = mailDraftJpaRepository;
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
    public IntegrationDtos.MailDraftView sendMailDraft(
            IntegrationDtos.MailDraftView draft,
            String idempotencyKey,
            List<IntegrationDtos.MailAttachment> attachments,
            String senderAddress
    ) {
        return draft;
    }
}
