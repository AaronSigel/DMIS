package com.dmis.backend.documents.application.dto;

import java.time.Instant;
import java.util.List;

public final class DocumentDtos {
    private DocumentDtos() {
    }

    public record DocumentVersionView(String versionId, String fileName, Instant createdAt) {
    }

    public record DocumentView(
            String id,
            String title,
            String ownerId,
            List<DocumentVersionView> versions,
            String storageRef,
            String extractedText
    ) {
    }
}
