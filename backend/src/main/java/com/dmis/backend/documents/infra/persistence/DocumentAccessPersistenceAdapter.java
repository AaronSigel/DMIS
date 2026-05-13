package com.dmis.backend.documents.infra.persistence;

import com.dmis.backend.documents.application.port.DocumentAccessPort;
import com.dmis.backend.documents.domain.DocumentAccessLevel;
import com.dmis.backend.documents.infra.persistence.entity.DocumentAccessEntity;
import com.dmis.backend.documents.infra.persistence.repository.DocumentAccessJpaRepository;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class DocumentAccessPersistenceAdapter implements DocumentAccessPort {

    private final DocumentAccessJpaRepository repository;

    public DocumentAccessPersistenceAdapter(DocumentAccessJpaRepository repository) {
        this.repository = repository;
    }

    @Override
    public Optional<DocumentAccessLevel> findLevel(String documentId, String principalId) {
        if (documentId == null || principalId == null || documentId.isBlank() || principalId.isBlank()) {
            return Optional.empty();
        }
        return repository.findByDocumentIdAndPrincipalId(documentId, principalId)
                .map(DocumentAccessEntity::getLevel)
                .map(DocumentAccessLevel::valueOf);
    }

    @Override
    public List<String> findAccessibleDocumentIds(String principalId) {
        if (principalId == null || principalId.isBlank()) {
            return List.of();
        }
        return repository.findAllByPrincipalId(principalId).stream()
                .map(DocumentAccessEntity::getDocumentId)
                .toList();
    }
}
