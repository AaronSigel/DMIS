package com.dmis.backend.documents.infra.persistence.repository;

import com.dmis.backend.documents.infra.persistence.entity.DocumentVersionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DocumentVersionJpaRepository extends JpaRepository<DocumentVersionEntity, String> {
    List<DocumentVersionEntity> findByDocumentIdOrderByCreatedAtAsc(String documentId);
}
