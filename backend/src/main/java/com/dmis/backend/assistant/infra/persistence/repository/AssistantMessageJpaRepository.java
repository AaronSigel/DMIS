package com.dmis.backend.assistant.infra.persistence.repository;

import com.dmis.backend.assistant.infra.persistence.entity.AssistantMessageEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AssistantMessageJpaRepository extends JpaRepository<AssistantMessageEntity, String> {
    List<AssistantMessageEntity> findByThreadIdOrderByCreatedAtAsc(String threadId);
}
