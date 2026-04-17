package com.dmis.backend.documents.infra.persistence;

import com.dmis.backend.documents.application.port.DocumentPort;
import com.dmis.backend.documents.domain.model.Document;
import com.dmis.backend.documents.domain.model.DocumentId;
import com.dmis.backend.documents.domain.model.DocumentVersion;
import com.dmis.backend.documents.domain.model.VersionId;
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
    public Document save(Document document) {
        DocumentVersion latest = document.latestVersion();
        documentJpaRepository.save(new DocumentEntity(
                document.id().value(),
                document.title(),
                document.ownerId(),
                latest.storageRef(),
                document.fullExtractedText()
        ));
        for (DocumentVersion version : document.versions()) {
            versionJpaRepository.save(new DocumentVersionEntity(
                    document.id().value() + "-" + version.versionId().value(),
                    document.id().value(),
                    version.versionId().value(),
                    version.fileName(),
                    version.contentType(),
                    version.sizeBytes(),
                    version.storageRef(),
                    version.extractedText(),
                    version.createdAt()
            ));
        }
        return findById(document.id()).orElseThrow();
    }

    @Override
    public Optional<Document> findById(DocumentId id) {
        return documentJpaRepository.findById(id.value()).map(this::toDomain);
    }

    @Override
    public List<Document> findAll() {
        return documentJpaRepository.findAll().stream()
                .map(this::toDomain)
                .toList();
    }

    private Document toDomain(DocumentEntity entity) {
        List<DocumentVersion> versions = versionJpaRepository.findByDocumentIdOrderByCreatedAtAsc(entity.getId()).stream()
                .map(v -> new DocumentVersion(
                        new VersionId(v.getVersionId()),
                        v.getFileName(),
                        v.getContentType(),
                        v.getSizeBytes(),
                        v.getStorageRef(),
                        v.getExtractedText(),
                        v.getCreatedAt()
                ))
                .toList();
        return Document.rehydrate(
                DocumentId.from(entity.getId()),
                entity.getTitle(),
                entity.getOwnerId(),
                versions
        );
    }
}
