package com.dmis.backend.integrations.infra.persistence.repository;

import com.dmis.backend.integrations.infra.persistence.entity.MailAccountEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MailAccountJpaRepository extends JpaRepository<MailAccountEntity, String> {
}

