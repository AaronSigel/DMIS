package com.dmis.backend.assistant.application;

import java.time.Instant;

public record DocumentContextItem(
        String documentId,
        String title,
        String fileName,
        String indexStatus,
        int indexedChunkCount,
        int extractedTextLength,
        Instant indexedAt,
        String diagnosticCode,
        String diagnosticMessage
) {
}
