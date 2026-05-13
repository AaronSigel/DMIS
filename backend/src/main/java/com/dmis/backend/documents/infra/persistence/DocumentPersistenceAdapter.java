package com.dmis.backend.documents.infra.persistence;

import com.dmis.backend.documents.application.port.DocumentPort;
import com.dmis.backend.documents.domain.model.Document;
import com.dmis.backend.documents.domain.model.DocumentId;
import com.dmis.backend.documents.domain.model.IndexStatus;
import com.dmis.backend.documents.infra.persistence.entity.DocumentEntity;
import com.dmis.backend.documents.infra.persistence.entity.DocumentTagEntity;
import com.dmis.backend.documents.infra.persistence.repository.DocumentJpaRepository;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

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
                document.tags(),
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
    public List<Document> findAllByIds(Collection<DocumentId> ids) {
        if (ids == null || ids.isEmpty()) {
            return List.of();
        }
        return documentJpaRepository.findAllById(ids.stream().map(DocumentId::value).toList()).stream()
                .map(this::toDomain)
                .toList();
    }

    @Override
    public List<Document> findAll() {
        return documentJpaRepository.findAll().stream()
                .map(this::toDomain)
                .toList();
    }

    @Override
    public Page<Document> findPage(ListQuery query, Pageable pageable) {
        Specification<DocumentEntity> specification = Specification.where(visibilitySpec(query))
                .and(statusSpec(query.status()))
                .and(typeSpec(query.type()))
                .and(dateFromSpec(query.dateFrom()))
                .and(dateToSpec(query.dateTo()))
                .and(tagSpec(query.tag()));
        return documentJpaRepository.findAll(specification, pageable).map(this::toDomain);
    }

    @Override
    public void deleteById(DocumentId id) {
        documentJpaRepository.deleteById(id.value());
    }

    private Specification<DocumentEntity> visibilitySpec(ListQuery query) {
        if (!query.admin()) {
            return (root, ignored, cb) -> {
                List<String> granted = query.grantedDocumentIds();
                // VIEWER никогда не «owner» по бизнес-смыслу: видим только grants.
                if (query.viewerOnly()) {
                    if (granted.isEmpty()) {
                        return cb.disjunction();
                    }
                    return root.get("id").in(granted);
                }
                if (granted.isEmpty()) {
                    return cb.equal(root.get("ownerId"), query.actorId());
                }
                return cb.or(
                        cb.equal(root.get("ownerId"), query.actorId()),
                        root.get("id").in(granted)
                );
            };
        }
        if (query.ownerId() == null || query.ownerId().isBlank()) {
            return null;
        }
        return (root, ignored, cb) -> cb.equal(root.get("ownerId"), query.ownerId().trim());
    }

    private Specification<DocumentEntity> statusSpec(String status) {
        if (status == null || status.isBlank()) {
            return null;
        }
        return (root, ignored, cb) -> cb.equal(root.get("indexStatus"), status.trim().toUpperCase());
    }

    private Specification<DocumentEntity> typeSpec(String type) {
        if (type == null || type.isBlank()) {
            return null;
        }
        String normalized = type.trim().toLowerCase();
        return (root, ignored, cb) -> cb.equal(cb.lower(root.get("contentType")), normalized);
    }

    private Specification<DocumentEntity> dateFromSpec(java.time.Instant dateFrom) {
        if (dateFrom == null) {
            return null;
        }
        return (root, ignored, cb) -> cb.greaterThanOrEqualTo(root.get("updatedAt"), dateFrom);
    }

    private Specification<DocumentEntity> dateToSpec(java.time.Instant dateTo) {
        if (dateTo == null) {
            return null;
        }
        return (root, ignored, cb) -> cb.lessThanOrEqualTo(root.get("updatedAt"), dateTo);
    }

    private Specification<DocumentEntity> tagSpec(String tag) {
        if (tag == null || tag.isBlank()) {
            return null;
        }
        String needle = tag.trim().toLowerCase(Locale.ROOT);
        return (root, query, cb) -> {
            if (query != null) {
                query.distinct(true);
            }
            Join<DocumentEntity, DocumentTagEntity> tagsJoin = root.join("tagEntities", JoinType.INNER);
            return cb.equal(tagsJoin.get("tagNorm"), needle);
        };
    }

    private Document toDomain(DocumentEntity entity) {
        return Document.rehydrate(
                DocumentId.from(entity.getId()),
                entity.getTitle(),
                entity.getOwnerId(),
                entity.getDescription(),
                entity.getTags(),
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
}
