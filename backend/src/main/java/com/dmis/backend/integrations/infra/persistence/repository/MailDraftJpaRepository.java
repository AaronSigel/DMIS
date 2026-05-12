package com.dmis.backend.integrations.infra.persistence.repository;

import com.dmis.backend.integrations.infra.persistence.entity.MailDraftEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MailDraftJpaRepository extends JpaRepository<MailDraftEntity, String> {
    List<MailDraftEntity> findByCreatedByOrderByIdDesc(String createdBy);
}
