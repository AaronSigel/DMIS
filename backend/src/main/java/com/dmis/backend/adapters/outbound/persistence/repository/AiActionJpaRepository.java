package com.dmis.backend.actions.infra.persistence.repository;

import com.dmis.backend.actions.infra.persistence.entity.AiActionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AiActionJpaRepository extends JpaRepository<AiActionEntity, String> {
}
