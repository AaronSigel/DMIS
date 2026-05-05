package com.dmis.backend.assistant.infra.persistence.repository;

import com.dmis.backend.assistant.infra.persistence.entity.AssistantThreadDocumentEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AssistantThreadDocumentJpaRepository extends JpaRepository<AssistantThreadDocumentEntity, String> {
    List<AssistantThreadDocumentEntity> findByThreadId(String threadId);

    Optional<AssistantThreadDocumentEntity> findByThreadIdAndDocumentId(String threadId, String documentId);
}
