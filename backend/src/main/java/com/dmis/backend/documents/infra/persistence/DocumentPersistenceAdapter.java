package com.dmis.backend.documents.infra.persistence;

import com.dmis.backend.documents.application.port.DocumentPort;
import com.dmis.backend.documents.domain.model.Document;
import com.dmis.backend.documents.domain.model.DocumentId;
import com.dmis.backend.documents.domain.model.IndexStatus;
import com.dmis.backend.documents.infra.persistence.entity.DocumentEntity;
import com.dmis.backend.documents.infra.persistence.repository.DocumentJpaRepository;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
public class DocumentPersistenceAdapter implements DocumentPort {
    private final DocumentJpaRepository documentJpaRepository;

    public DocumentPersistenceAdapter(DocumentJpaRepository documentJpaRepository) {
        this.documentJpaRepository = documentJpaRepository;
    }

    @Override
    public Document save(Document document) {
        documentJpaRepository.save(new DocumentEntity(
                document.id().value(),
                document.title(),
                document.ownerId(),
                document.storageRef(),
                document.fullExtractedText(),
                document.description(),
                encodeTags(document.tags()),
                document.source(),
                document.category(),
                document.createdAt(),
                document.updatedAt(),
                document.fileName(),
                document.contentType(),
                document.sizeBytes(),
                document.indexStatus().name(),
                document.indexedChunkCount(),
                document.indexedAt()
        ));
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

    @Override
    public void deleteById(DocumentId id) {
        documentJpaRepository.deleteById(id.value());
    }

    private Document toDomain(DocumentEntity entity) {
        return Document.rehydrate(
                DocumentId.from(entity.getId()),
                entity.getTitle(),
                entity.getOwnerId(),
                entity.getDescription(),
                decodeTags(entity.getTags()),
                entity.getSource(),
                entity.getCategory(),
                entity.getCreatedAt(),
                entity.getUpdatedAt(),
                entity.getFileName(),
                entity.getContentType(),
                entity.getSizeBytes(),
                entity.getStorageRef(),
                entity.getExtractedText(),
                IndexStatus.valueOf(entity.getIndexStatus()),
                entity.getIndexedChunkCount(),
                entity.getIndexedAt()
        );
    }

    private static String encodeTags(List<String> tags) {
        return tags.stream().map(String::trim).filter(tag -> !tag.isBlank()).collect(Collectors.joining(","));
    }

    private static List<String> decodeTags(String raw) {
        if (raw == null || raw.isBlank()) {
            return List.of();
        }
        return List.of(raw.split(",")).stream()
                .map(String::trim)
                .filter(tag -> !tag.isBlank())
                .toList();
    }
}
