package com.dmis.backend.documents.domain.model;

import java.time.Instant;
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
    private final String fileName;
    private final String contentType;
    private final long sizeBytes;
    private final String storageRef;
    private final String extractedText;
    private final IndexStatus indexStatus;
    private final int indexedChunkCount;
    private final Instant indexedAt;

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
            String fileName,
            String contentType,
            long sizeBytes,
            String storageRef,
            String extractedText,
            IndexStatus indexStatus,
            int indexedChunkCount,
            Instant indexedAt
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
        if (fileName == null || fileName.isBlank()) {
            throw new IllegalArgumentException("File name is required");
        }
        if (contentType == null || contentType.isBlank()) {
            throw new IllegalArgumentException("Content type is required");
        }
        if (sizeBytes < 0) {
            throw new IllegalArgumentException("Size must be non-negative");
        }
        if (storageRef == null || storageRef.isBlank()) {
            throw new IllegalArgumentException("Storage reference is required");
        }
        if (extractedText == null) {
            throw new IllegalArgumentException("Extracted text is required");
        }
        if (indexStatus == null) {
            throw new IllegalArgumentException("Index status is required");
        }
        if (indexedChunkCount < 0) {
            throw new IllegalArgumentException("Indexed chunk count must be non-negative");
        }
        if (indexStatus == IndexStatus.INDEXED && indexedAt == null) {
            throw new IllegalArgumentException("Indexed at is required when status is INDEXED");
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
        this.fileName = fileName;
        this.contentType = contentType;
        this.sizeBytes = sizeBytes;
        this.storageRef = storageRef;
        this.extractedText = extractedText;
        this.indexStatus = indexStatus;
        this.indexedChunkCount = indexedChunkCount;
        this.indexedAt = indexedAt;
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
                fileName,
                contentType,
                sizeBytes,
                storageRef,
                extractedText,
                IndexStatus.PENDING,
                0,
                null
        );
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
            String fileName,
            String contentType,
            long sizeBytes,
            String storageRef,
            String extractedText,
            IndexStatus indexStatus,
            int indexedChunkCount,
            Instant indexedAt
    ) {
        return new Document(
                id,
                title,
                ownerId,
                description,
                tags,
                source,
                category,
                createdAt,
                updatedAt,
                fileName,
                contentType,
                sizeBytes,
                storageRef,
                extractedText,
                indexStatus,
                indexedChunkCount,
                indexedAt
        );
    }

    public Document markIndexed(int chunks, Instant indexedAt) {
        return new Document(
                id,
                title,
                ownerId,
                description,
                tags,
                source,
                category,
                createdAt,
                indexedAt,
                fileName,
                contentType,
                sizeBytes,
                storageRef,
                extractedText,
                IndexStatus.INDEXED,
                chunks,
                indexedAt
        );
    }

    public Document markFailed(Instant updatedAt) {
        return new Document(
                id,
                title,
                ownerId,
                description,
                tags,
                source,
                category,
                createdAt,
                updatedAt,
                fileName,
                contentType,
                sizeBytes,
                storageRef,
                extractedText,
                IndexStatus.FAILED,
                0,
                null
        );
    }

    public Document withTags(List<String> newTags, Instant updatedAt) {
        List<String> normalized = newTags.stream()
                .map(String::trim)
                .filter(tag -> !tag.isBlank())
                .distinct()
                .toList();
        return new Document(
                id,
                title,
                ownerId,
                description,
                normalized,
                source,
                category,
                createdAt,
                updatedAt,
                fileName,
                contentType,
                sizeBytes,
                storageRef,
                extractedText,
                indexStatus,
                indexedChunkCount,
                indexedAt
        );
    }

    /** Новое отображаемое имя документа (trim, non-blank). */
    public Document withTitle(String newTitle, Instant updatedAt) {
        String t = newTitle == null ? "" : newTitle.trim();
        if (t.isBlank()) {
            throw new IllegalArgumentException("Document title is required");
        }
        return new Document(
                id,
                t,
                ownerId,
                description,
                tags,
                source,
                category,
                createdAt,
                updatedAt,
                fileName,
                contentType,
                sizeBytes,
                storageRef,
                extractedText,
                indexStatus,
                indexedChunkCount,
                indexedAt
        );
    }

    /** Переименование текущего файла документа; MinIO-ключ не меняется. */
    public Document withFileName(String newFileName, Instant updatedAt) {
        String f = newFileName == null ? "" : newFileName.trim();
        if (f.isBlank()) {
            throw new IllegalArgumentException("File name is required");
        }
        return new Document(
                id,
                title,
                ownerId,
                description,
                tags,
                source,
                category,
                createdAt,
                updatedAt,
                f,
                contentType,
                sizeBytes,
                storageRef,
                extractedText,
                indexStatus,
                indexedChunkCount,
                indexedAt
        );
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

    public String fileName() {
        return fileName;
    }

    public String contentType() {
        return contentType;
    }

    public long sizeBytes() {
        return sizeBytes;
    }

    public String storageRef() {
        return storageRef;
    }

    public String extractedText() {
        return extractedText;
    }

    public IndexStatus indexStatus() {
        return indexStatus;
    }

    public int indexedChunkCount() {
        return indexedChunkCount;
    }

    public Instant indexedAt() {
        return indexedAt;
    }

    public String fullExtractedText() {
        return extractedText;
    }

    public int versionCount() {
        return 1;
    }

    public long totalSizeBytes() {
        return sizeBytes;
    }

    public Instant lastVersionAt() {
        return createdAt;
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
