package com.dmis.backend.documents.application;

import com.dmis.backend.documents.application.port.DocumentChunkPort;
import com.dmis.backend.documents.application.port.EmbeddingsPort;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
public class DocumentIndexingService {
    private static final int DEFAULT_CHUNK_SIZE = 1_000;
    private static final int DEFAULT_OVERLAP = 200;

    private final EmbeddingsPort embeddingsPort;
    private final DocumentChunkPort documentChunkPort;
    private final TextChunker chunker = new TextChunker(DEFAULT_CHUNK_SIZE, DEFAULT_OVERLAP);

    public DocumentIndexingService(EmbeddingsPort embeddingsPort, DocumentChunkPort documentChunkPort) {
        this.embeddingsPort = embeddingsPort;
        this.documentChunkPort = documentChunkPort;
    }

    public int index(String documentId, String versionId, String text) {
        List<String> chunks = chunker.chunk(text);
        if (chunks.isEmpty()) {
            documentChunkPort.replaceChunks(documentId, versionId, Instant.now(), List.of());
            return 0;
        }

        List<float[]> embeddings = embeddingsPort.embed(chunks);
        if (embeddings.size() != chunks.size()) {
            throw new IllegalStateException("Embeddings size mismatch: " + embeddings.size() + " != " + chunks.size());
        }

        Instant now = Instant.now();
        List<DocumentChunkPort.DocumentChunk> rows = new ArrayList<>(chunks.size());
        for (int i = 0; i < chunks.size(); i++) {
            String id = documentId + "-" + versionId + "-" + i;
            rows.add(new DocumentChunkPort.DocumentChunk(id, i, chunks.get(i), embeddings.get(i)));
        }
        documentChunkPort.replaceChunks(documentId, versionId, now, rows);
        return rows.size();
    }
}

