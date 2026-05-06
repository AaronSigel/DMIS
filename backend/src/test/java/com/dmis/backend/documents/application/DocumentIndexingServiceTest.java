package com.dmis.backend.documents.application;

import com.dmis.backend.documents.application.port.DocumentChunkPort;
import com.dmis.backend.documents.application.port.EmbeddingsPort;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class DocumentIndexingServiceTest {
    @Test
    void indexRejectsEmbeddingDimensionMismatch() {
        EmbeddingsPort embeddings = texts -> List.of(new float[768]);
        CapturingChunkPort chunkPort = new CapturingChunkPort();
        DocumentIndexingService service = new DocumentIndexingService(embeddings, chunkPort);

        IllegalStateException ex = assertThrows(
                IllegalStateException.class,
                () -> service.index("doc-1", "hello world")
        );

        assertTrue(ex.getMessage().contains("Embedding dimension mismatch"));
    }

    @Test
    void indexWritesEmbeddingMetadataForEachChunk() {
        EmbeddingsPort embeddings = texts -> {
            List<float[]> vectors = new ArrayList<>(texts.size());
            for (int i = 0; i < texts.size(); i++) {
                vectors.add(dummyEmbedding1024());
            }
            return vectors;
        };
        CapturingChunkPort chunkPort = new CapturingChunkPort();
        DocumentIndexingService service = new DocumentIndexingService(embeddings, chunkPort);

        int chunks = service.index("doc-1", "hello world");
        assertEquals(1, chunks);
        assertEquals(1, chunkPort.chunks.size());

        DocumentChunkPort.DocumentChunk row = chunkPort.chunks.getFirst();
        assertEquals("/models/bge-m3", row.embeddingModel());
        assertEquals(1024, row.embeddingDim());
        assertTrue(row.embeddingNormalized());
    }

    private static float[] dummyEmbedding1024() {
        float[] v = new float[1024];
        v[0] = 1.0f;
        return v;
    }

    private static final class CapturingChunkPort implements DocumentChunkPort {
        private final List<DocumentChunk> chunks = new ArrayList<>();

        @Override
        public void replaceChunks(String documentId, Instant createdAt, List<DocumentChunk> chunks) {
            this.chunks.clear();
            this.chunks.addAll(chunks);
        }
    }
}
