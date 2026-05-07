package com.dmis.backend.documents.infra.persistence.repository;

import com.dmis.backend.documents.infra.persistence.entity.DocumentTagEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DocumentTagJpaRepository extends JpaRepository<DocumentTagEntity, Long> {
}
