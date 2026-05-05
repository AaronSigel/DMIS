package com.dmis.backend.assistant.infra.persistence.repository;

import com.dmis.backend.assistant.infra.persistence.entity.AssistantPreferenceEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AssistantPreferenceJpaRepository extends JpaRepository<AssistantPreferenceEntity, String> {
}
