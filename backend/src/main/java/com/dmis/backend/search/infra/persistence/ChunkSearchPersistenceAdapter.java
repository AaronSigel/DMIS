package com.dmis.backend.search.infra.persistence;

import com.dmis.backend.documents.application.port.EmbeddingsPort;
import com.dmis.backend.search.application.port.ChunkSearchPort;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Locale;

@Component
@Profile("!test")
public class ChunkSearchPersistenceAdapter implements ChunkSearchPort {
    private final JdbcTemplate jdbcTemplate;
    private final EmbeddingsPort embeddingsPort;

    public ChunkSearchPersistenceAdapter(JdbcTemplate jdbcTemplate, EmbeddingsPort embeddingsPort) {
        this.jdbcTemplate = jdbcTemplate;
        this.embeddingsPort = embeddingsPort;
    }

    @Override
    public List<ChunkHit> search(String actorId, boolean isAdmin, String query, int limit) {
        float[] q = embeddingsPort.embed(List.of(query)).getFirst();
        String qVec = toVectorLiteral(q);

        String sql =
                "SELECT d.id AS document_id, d.title AS title, dc.id AS chunk_id, dc.chunk_text AS chunk_text, " +
                        "(0.6 * ts_rank_cd(dc.chunk_tsv, plainto_tsquery('simple', ?)) + " +
                        " 0.4 * (1 - (dc.embedding <=> (?::vector)))) AS score " +
                        "FROM document_chunks dc " +
                        "JOIN documents d ON d.id = dc.document_id " +
                        "WHERE (? = true OR d.owner_id = ?) " +
                        "ORDER BY score DESC " +
                        "LIMIT ?";

        return jdbcTemplate.query(
                sql,
                (rs, rowNum) -> new ChunkHit(
                        rs.getString("document_id"),
                        rs.getString("title"),
                        rs.getString("chunk_id"),
                        rs.getString("chunk_text"),
                        rs.getDouble("score")
                ),
                query,
                qVec,
                isAdmin,
                actorId,
                limit
        );
    }

    private static String toVectorLiteral(float[] embedding) {
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

