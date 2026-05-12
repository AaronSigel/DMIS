package com.dmis.backend.integrations.infra.persistence.repository;

import com.dmis.backend.integrations.infra.persistence.entity.MailDraftAttachmentEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MailDraftAttachmentJpaRepository extends JpaRepository<MailDraftAttachmentEntity, MailDraftAttachmentEntity.Key> {
    List<MailDraftAttachmentEntity> findByDraftId(String draftId);

    void deleteByDraftId(String draftId);
}
