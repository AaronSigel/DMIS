package com.dmis.backend.documents.infra.persistence.repository;

import com.dmis.backend.documents.infra.persistence.entity.DocumentEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DocumentJpaRepository extends JpaRepository<DocumentEntity, String> {
}
