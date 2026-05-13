package com.dmis.backend.documents.infra.persistence.repository;

import com.dmis.backend.documents.infra.persistence.entity.DocumentAccessEntity;
import com.dmis.backend.documents.infra.persistence.entity.DocumentAccessEntity.DocumentAccessId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DocumentAccessJpaRepository extends JpaRepository<DocumentAccessEntity, DocumentAccessId> {

    Optional<DocumentAccessEntity> findByDocumentIdAndPrincipalId(String documentId, String principalId);

    List<DocumentAccessEntity> findAllByPrincipalId(String principalId);
}
