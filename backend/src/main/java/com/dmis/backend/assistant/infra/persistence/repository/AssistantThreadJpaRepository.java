package com.dmis.backend.assistant.infra.persistence.repository;

import com.dmis.backend.assistant.infra.persistence.entity.AssistantThreadEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AssistantThreadJpaRepository extends JpaRepository<AssistantThreadEntity, String> {
    List<AssistantThreadEntity> findByOwnerId(String ownerId);
}
