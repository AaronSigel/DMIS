package com.dmis.backend.documents.infra.persistence;

import com.dmis.backend.documents.application.dto.DocumentDtos;
import com.dmis.backend.documents.application.port.DocumentPort;
import com.dmis.backend.documents.infra.persistence.entity.DocumentEntity;
import com.dmis.backend.documents.infra.persistence.entity.DocumentVersionEntity;
import com.dmis.backend.documents.infra.persistence.repository.DocumentJpaRepository;
import com.dmis.backend.documents.infra.persistence.repository.DocumentVersionJpaRepository;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class DocumentPersistenceAdapter implements DocumentPort {
    private final DocumentJpaRepository documentJpaRepository;
    private final DocumentVersionJpaRepository versionJpaRepository;

    public DocumentPersistenceAdapter(DocumentJpaRepository documentJpaRepository, DocumentVersionJpaRepository versionJpaRepository) {
        this.documentJpaRepository = documentJpaRepository;
        this.versionJpaRepository = versionJpaRepository;
    }

    @Override
    public DocumentDtos.DocumentView save(DocumentDtos.DocumentView document) {
        documentJpaRepository.save(new DocumentEntity(
                document.id(),
                document.title(),
                document.ownerId(),
                document.storageRef(),
                document.extractedText()
        ));
        for (DocumentDtos.DocumentVersionView version : document.versions()) {
            versionJpaRepository.save(new DocumentVersionEntity(
                    document.id() + "-" + version.versionId(),
                    document.id(),
                    version.versionId(),
                    version.fileName(),
                    version.createdAt()
            ));
        }
        return findById(document.id()).orElseThrow();
    }

    @Override
    public Optional<DocumentDtos.DocumentView> findById(String id) {
        return documentJpaRepository.findById(id).map(entity -> new DocumentDtos.DocumentView(
                entity.getId(),
                entity.getTitle(),
                entity.getOwnerId(),
                versionJpaRepository.findByDocumentIdOrderByCreatedAtAsc(entity.getId()).stream()
                        .map(v -> new DocumentDtos.DocumentVersionView(v.getVersionId(), v.getFileName(), v.getCreatedAt()))
                        .toList(),
                entity.getStorageRef(),
                entity.getExtractedText()
        ));
    }

    @Override
    public List<DocumentDtos.DocumentView> findAll() {
        return documentJpaRepository.findAll().stream()
                .map(doc -> findById(doc.getId()).orElseThrow())
                .toList();
    }

    @Override
    public DocumentDtos.DocumentVersionView addVersion(String documentId, DocumentDtos.DocumentVersionView version) {
        versionJpaRepository.save(new DocumentVersionEntity(
                documentId + "-" + version.versionId(),
                documentId,
                version.versionId(),
                version.fileName(),
                version.createdAt()
        ));
        return version;
    }
}
