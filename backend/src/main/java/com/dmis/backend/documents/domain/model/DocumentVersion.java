package com.dmis.backend.documents.domain.model;

import java.time.Instant;

public record DocumentVersion(
        VersionId versionId,
        String fileName,
        String contentType,
        long sizeBytes,
        String storageRef,
        String extractedText,
        Instant createdAt,
        IndexStatus indexStatus,
        int indexedChunkCount,
        Instant indexedAt
) {
    public DocumentVersion {
        if (versionId == null) {
            throw new IllegalArgumentException("Version id is required");
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
        if (createdAt == null) {
            throw new IllegalArgumentException("Created at is required");
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
    }
}
