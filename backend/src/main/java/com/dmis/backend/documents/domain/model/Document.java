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
    private final List<DocumentVersion> versions;

    private Document(DocumentId id, String title, String ownerId, List<DocumentVersion> versions) {
        if (id == null) {
            throw new IllegalArgumentException("Document id is required");
        }
        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException("Document title is required");
        }
        if (ownerId == null || ownerId.isBlank()) {
            throw new IllegalArgumentException("Owner id is required");
        }
        if (versions == null || versions.isEmpty()) {
            throw new IllegalArgumentException("Document must have at least one version");
        }
        this.id = id;
        this.title = title;
        this.ownerId = ownerId;
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
        return new Document(id, title, ownerId, List.of(
                new DocumentVersion(
                        VersionId.initial(),
                        fileName,
                        contentType,
                        sizeBytes,
                        storageRef,
                        extractedText,
                        createdAt
                )
        ));
    }

    public static Document rehydrate(DocumentId id, String title, String ownerId, List<DocumentVersion> versions) {
        return new Document(id, title, ownerId, versions);
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
        updated.add(new DocumentVersion(
                VersionId.next(versions.size()),
                fileName,
                contentType,
                sizeBytes,
                storageRef,
                extractedText,
                createdAt
        ));
        return new Document(id, title, ownerId, updated);
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
