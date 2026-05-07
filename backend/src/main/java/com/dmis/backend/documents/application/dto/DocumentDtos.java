package com.dmis.backend.documents.application.dto;

import java.time.Instant;
import java.util.List;

public final class DocumentDtos {
    private DocumentDtos() {
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
            long totalSizeBytes,
            String fileName,
            String contentType,
            String storageRef,
            int indexedChunkCount,
            Instant indexedAt,
            String extractedTextPreview,
            int extractedTextLength,
            boolean extractedTextTruncated
    ) {
    }

    public record PageResponse<T>(
            List<T> content,
            long totalElements,
            int totalPages,
            int page,
            int size
    ) {
    }

    public record DocumentListQuery(
            String status,
            String type,
            Instant dateFrom,
            Instant dateTo,
            String sortBy,
            String order,
            String ownerId,
            String tag,
            int page,
            int size
    ) {
    }

    /**
     * Частичное обновление документа: каждое поле опционально.
     * {@code tags == null} — не менять теги; иначе заменить список тегов.
     * {@code title} / {@code fileName} — {@code null} означает «не менять».
     */
    public record PatchDocumentRequest(
            List<String> tags,
            String title,
            String fileName
    ) {
    }

    public record DocumentBinary(
            String fileName,
            String contentType,
            byte[] content
    ) {
    }

    public record PresignedDownloadUrl(
            String url,
            int ttlSeconds
    ) {
    }
}
