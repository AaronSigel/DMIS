package com.dmis.backend.documents.infra.persistence;

import com.dmis.backend.documents.application.port.DocumentChunkPort;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.Locale;

@Component
@Profile("test")
public class DocumentChunkPersistenceTestAdapter implements DocumentChunkPort {
    private final JdbcTemplate jdbcTemplate;

    public DocumentChunkPersistenceTestAdapter(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    @Transactional
    public void replaceChunks(String documentId, String versionId, Instant createdAt, List<DocumentChunk> chunks) {
        jdbcTemplate.update(
                "DELETE FROM document_chunks WHERE document_id = ? AND version_id = ?",
                documentId,
                versionId
        );

        for (DocumentChunk chunk : chunks) {
            jdbcTemplate.update(
                    "INSERT INTO document_chunks (" +
                            "id, document_id, version_id, chunk_index, chunk_text, embedding, " +
                            "embedding_model, embedding_dim, embedding_normalized, created_at, indexed_at) " +
                            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    chunk.id(),
                    documentId,
                    versionId,
                    chunk.chunkIndex(),
                    chunk.chunkText(),
                    toVectorLiteral(chunk.embedding()),
                    chunk.embeddingModel(),
                    chunk.embeddingDim(),
                    chunk.embeddingNormalized(),
                    Timestamp.from(createdAt),
                    Timestamp.from(createdAt)
            );
        }
    }

    private static String toVectorLiteral(float[] embedding) {
        if (embedding == null || embedding.length == 0) {
            return "[]";
        }
        StringBuilder sb = new StringBuilder();
        sb.append('[');
        for (int i = 0; i < embedding.length; i++) {
            if (i > 0) {
                sb.append(',');
            }
            sb.append(String.format(Locale.ROOT, "%.8f", embedding[i]));
        }
        sb.append(']');
        return sb.toString();
    }
}

