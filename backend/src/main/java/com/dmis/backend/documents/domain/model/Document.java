package com.dmis.backend.documents.domain.model;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;

public final class Document {
    private final DocumentId id;
    private final String title;
    private final String ownerId;
    private final String description;
    private final List<String> tags;
    private final String source;
    private final String category;
    private final Instant createdAt;
    private final Instant updatedAt;
    private final List<DocumentVersion> versions;

    private Document(
            DocumentId id,
            String title,
            String ownerId,
            String description,
            List<String> tags,
            String source,
            String category,
            Instant createdAt,
            Instant updatedAt,
            List<DocumentVersion> versions
    ) {
        if (id == null) {
            throw new IllegalArgumentException("Document id is required");
        }
        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException("Document title is required");
        }
        if (ownerId == null || ownerId.isBlank()) {
            throw new IllegalArgumentException("Owner id is required");
        }
        if (description == null) {
            throw new IllegalArgumentException("Description is required");
        }
        if (tags == null) {
            throw new IllegalArgumentException("Tags are required");
        }
        if (source == null || source.isBlank()) {
            throw new IllegalArgumentException("Source is required");
        }
        if (category == null || category.isBlank()) {
            throw new IllegalArgumentException("Category is required");
        }
        if (createdAt == null) {
            throw new IllegalArgumentException("Created at is required");
        }
        if (updatedAt == null) {
            throw new IllegalArgumentException("Updated at is required");
        }
        if (versions == null || versions.isEmpty()) {
            throw new IllegalArgumentException("Document must have at least one version");
        }
        this.id = id;
        this.title = title;
        this.ownerId = ownerId;
        this.description = description;
        this.tags = List.copyOf(tags);
        this.source = source;
        this.category = category;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.versions = List.copyOf(versions);
    }

    public static Document create(
            DocumentId id,
            String title,
            String ownerId,
            String fileName,
            String contentType,
            long sizeBytes,
            String storageRef,
            String extractedText,
            Instant createdAt
    ) {
        return new Document(
                id,
                title,
                ownerId,
                "",
                List.of(),
                "upload",
                "general",
                createdAt,
                createdAt,
                List.of(
                new DocumentVersion(
                        VersionId.initial(),
                        fileName,
                        contentType,
                        sizeBytes,
                        storageRef,
                        extractedText,
                        createdAt,
                        IndexStatus.PENDING,
                        0,
                        null
                )
        ));
    }

    public static Document rehydrate(
            DocumentId id,
            String title,
            String ownerId,
            String description,
            List<String> tags,
            String source,
            String category,
            Instant createdAt,
            Instant updatedAt,
            List<DocumentVersion> versions
    ) {
        return new Document(id, title, ownerId, description, tags, source, category, createdAt, updatedAt, versions);
    }

    public Document addVersion(
            String fileName,
            String contentType,
            long sizeBytes,
            String storageRef,
            String extractedText,
            Instant createdAt
    ) {
        List<DocumentVersion> updated = new ArrayList<>(versions);
        Instant now = Instant.now();
        updated.add(new DocumentVersion(
                VersionId.next(versions.size()),
                fileName,
                contentType,
                sizeBytes,
                storageRef,
                extractedText,
                createdAt,
                IndexStatus.PENDING,
                0,
                null
        ));
        return new Document(id, title, ownerId, description, tags, source, category, this.createdAt, now, updated);
    }

    public Document markVersionIndexed(VersionId versionId, int chunks, Instant indexedAt) {
        List<DocumentVersion> updated = versions.stream()
                .map(version -> version.versionId().equals(versionId)
                        ? new DocumentVersion(
                        version.versionId(),
                        version.fileName(),
                        version.contentType(),
                        version.sizeBytes(),
                        version.storageRef(),
                        version.extractedText(),
                        version.createdAt(),
                        IndexStatus.INDEXED,
                        chunks,
                        indexedAt
                )
                        : version)
                .toList();
        return new Document(id, title, ownerId, description, tags, source, category, createdAt, indexedAt, updated);
    }

    public Document markVersionFailed(VersionId versionId, Instant updatedAt) {
        List<DocumentVersion> updated = versions.stream()
                .map(version -> version.versionId().equals(versionId)
                        ? new DocumentVersion(
                        version.versionId(),
                        version.fileName(),
                        version.contentType(),
                        version.sizeBytes(),
                        version.storageRef(),
                        version.extractedText(),
                        version.createdAt(),
                        IndexStatus.FAILED,
                        0,
                        null
                )
                        : version)
                .toList();
        return new Document(id, title, ownerId, description, tags, source, category, createdAt, updatedAt, updated);
    }

    public Document withTags(List<String> newTags, Instant updatedAt) {
        List<String> normalized = newTags.stream()
                .map(String::trim)
                .filter(tag -> !tag.isBlank())
                .distinct()
                .toList();
        return new Document(id, title, ownerId, description, normalized, source, category, createdAt, updatedAt, versions);
    }

    public DocumentId id() {
        return id;
    }

    public String title() {
        return title;
    }

    public String ownerId() {
        return ownerId;
    }

    public String description() {
        return description;
    }

    public List<String> tags() {
        return tags;
    }

    public String source() {
        return source;
    }

    public String category() {
        return category;
    }

    public Instant createdAt() {
        return createdAt;
    }

    public Instant updatedAt() {
        return updatedAt;
    }

    public List<DocumentVersion> versions() {
        return versions;
    }

    public DocumentVersion latestVersion() {
        return versions.stream()
                .max(Comparator.comparing(DocumentVersion::createdAt))
                .orElseThrow();
    }

    public String fullExtractedText() {
        return versions.stream()
                .map(DocumentVersion::extractedText)
                .filter(text -> !text.isBlank())
                .reduce((left, right) -> left + "\n" + right)
                .orElse("");
    }

    public int versionCount() {
        return versions.size();
    }

    public long totalSizeBytes() {
        return versions.stream().mapToLong(DocumentVersion::sizeBytes).sum();
    }

    public Instant lastVersionAt() {
        return latestVersion().createdAt();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Document document)) {
            return false;
        }
        return id.equals(document.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
