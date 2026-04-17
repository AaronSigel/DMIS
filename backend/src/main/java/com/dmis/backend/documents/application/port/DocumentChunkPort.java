package com.dmis.backend.documents.application.port;

import java.time.Instant;
import java.util.List;

public interface DocumentChunkPort {
    void replaceChunks(String documentId, String versionId, Instant createdAt, List<DocumentChunk> chunks);

    record DocumentChunk(
            String id,
            int chunkIndex,
            String chunkText,
            float[] embedding,
            String embeddingModel,
            int embeddingDim,
            boolean embeddingNormalized
    ) {
    }
}
