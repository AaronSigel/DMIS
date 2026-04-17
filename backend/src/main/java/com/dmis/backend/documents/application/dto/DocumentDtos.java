package com.dmis.backend.documents.application.dto;

import java.time.Instant;
import java.util.List;

public final class DocumentDtos {
    private DocumentDtos() {
    }

    public record DocumentVersionView(
            String versionId,
            String fileName,
            String contentType,
            long sizeBytes,
            String storageRef,
            Instant createdAt,
            String indexStatus,
            int indexedChunkCount,
            Instant indexedAt,
            boolean latest
    ) {
    }

    public record DocumentView(
            String id,
            String title,
            String ownerId,
            String description,
            List<String> tags,
            String source,
            String category,
            String status,
            String type,
            Instant createdAt,
            Instant updatedAt,
            int versionCount,
            long totalSizeBytes,
            Instant lastVersionAt,
            List<DocumentVersionView> versions,
            String storageRef,
            String extractedText
    ) {
    }

    public record DocumentListQuery(
            String status,
            String type,
            Instant dateFrom,
            Instant dateTo,
            String sortBy,
            String order
    ) {
    }

    public record DocumentBinary(
            String fileName,
            String contentType,
            byte[] content
    ) {
    }
}
