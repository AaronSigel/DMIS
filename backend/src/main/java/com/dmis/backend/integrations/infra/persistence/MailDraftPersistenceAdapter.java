package com.dmis.backend.integrations.infra.persistence;

import com.dmis.backend.integrations.application.port.MailDraftPort;
import com.dmis.backend.integrations.infra.persistence.entity.MailDraftAttachmentEntity;
import com.dmis.backend.integrations.infra.persistence.entity.MailDraftEntity;
import com.dmis.backend.integrations.infra.persistence.repository.MailDraftAttachmentJpaRepository;
import com.dmis.backend.integrations.infra.persistence.repository.MailDraftJpaRepository;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class MailDraftPersistenceAdapter implements MailDraftPort {
    private final MailDraftJpaRepository mailDraftJpaRepository;
    private final MailDraftAttachmentJpaRepository mailDraftAttachmentJpaRepository;

    public MailDraftPersistenceAdapter(
            MailDraftJpaRepository mailDraftJpaRepository,
            MailDraftAttachmentJpaRepository mailDraftAttachmentJpaRepository
    ) {
        this.mailDraftJpaRepository = mailDraftJpaRepository;
        this.mailDraftAttachmentJpaRepository = mailDraftAttachmentJpaRepository;
    }

    @Override
    public List<MailDraftSummary> listByCreatedBy(String createdBy) {
        return mailDraftJpaRepository.findByCreatedByOrderByIdDesc(createdBy).stream()
                .map(this::toSummary)
                .toList();
    }

    @Override
    public Optional<MailDraftSummary> findById(String id) {
        return mailDraftJpaRepository.findById(id).map(this::toSummary);
    }

    @Override
    public boolean existsById(String id) {
        return mailDraftJpaRepository.existsById(id);
    }

    @Override
    public MailDraftSummary save(MailDraftSummary draft) {
        mailDraftJpaRepository.save(new MailDraftEntity(
                draft.id(),
                draft.recipient(),
                draft.subject(),
                draft.body(),
                draft.createdBy()
        ));
        return draft;
    }

    @Override
    public void deleteById(String id) {
        mailDraftAttachmentJpaRepository.deleteByDraftId(id);
        mailDraftJpaRepository.deleteById(id);
    }

    @Override
    public List<String> findAttachmentDocumentIds(String draftId) {
        return mailDraftAttachmentJpaRepository.findByDraftId(draftId).stream()
                .map(MailDraftAttachmentEntity::getDocumentId)
                .toList();
    }

    @Override
    public void replaceAttachmentDocumentIds(String draftId, List<String> documentIds) {
        mailDraftAttachmentJpaRepository.deleteByDraftId(draftId);
        if (documentIds == null || documentIds.isEmpty()) {
            return;
        }
        for (String documentId : documentIds) {
            mailDraftAttachmentJpaRepository.save(new MailDraftAttachmentEntity(draftId, documentId));
        }
    }

    private MailDraftSummary toSummary(MailDraftEntity e) {
        return new MailDraftSummary(e.getId(), e.getRecipient(), e.getSubject(), e.getBody(), e.getCreatedBy());
    }
}
