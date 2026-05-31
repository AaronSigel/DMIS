package com.dmis.backend.actions.infra.persistence.repository;

import com.dmis.backend.actions.infra.persistence.entity.AiActionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AiActionJpaRepository extends JpaRepository<AiActionEntity, String> {
    List<AiActionEntity> findByAssistantThreadId(String assistantThreadId);
}
