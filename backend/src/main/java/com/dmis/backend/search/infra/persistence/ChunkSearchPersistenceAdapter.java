package com.dmis.backend.search.infra.persistence;

import com.dmis.backend.documents.application.port.EmbeddingsPort;
import com.dmis.backend.search.application.port.ChunkSearchPort;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Component
@Profile("!test")
public class ChunkSearchPersistenceAdapter implements ChunkSearchPort {
    private static final int RRF_K = 60;
    private final JdbcTemplate jdbcTemplate;
    private final EmbeddingsPort embeddingsPort;

    public ChunkSearchPersistenceAdapter(JdbcTemplate jdbcTemplate, EmbeddingsPort embeddingsPort) {
        this.jdbcTemplate = jdbcTemplate;
        this.embeddingsPort = embeddingsPort;
    }

    @Override
    public List<ChunkHit> search(String actorId, boolean isAdmin, String query, int limit, List<String> documentIds) {
        float[] q = embeddingsPort.embed(List.of(query)).getFirst();
        String qVec = toVectorLiteral(q);
        int candidateLimit = Math.max(limit * 5, limit);
        String docFilter = documentIds == null || documentIds.isEmpty()
                ? ""
                : "AND dc.document_id IN (" + documentIds.stream().map(id -> "?").collect(Collectors.joining(",")) + ") ";

        String sql =
                "WITH fts_candidates AS (" +
                        "SELECT dc.id AS chunk_id, dc.document_id AS document_id, d.title AS title, dc.chunk_text AS chunk_text, " +
                        "ROW_NUMBER() OVER (ORDER BY ts_rank_cd(dc.chunk_tsv, plainto_tsquery('simple', ?)) DESC, dc.created_at DESC) AS fts_rank " +
                        "FROM document_chunks dc " +
                        "JOIN documents d ON d.id = dc.document_id " +
                        "WHERE (? = true OR d.owner_id = ?) " +
                        docFilter +
                        "AND dc.chunk_tsv @@ plainto_tsquery('simple', ?) " +
                        "ORDER BY ts_rank_cd(dc.chunk_tsv, plainto_tsquery('simple', ?)) DESC, dc.created_at DESC " +
                        "LIMIT ?" +
                        "), ann_candidates AS (" +
                        "SELECT dc.id AS chunk_id, dc.document_id AS document_id, d.title AS title, dc.chunk_text AS chunk_text, " +
                        "ROW_NUMBER() OVER (ORDER BY dc.embedding <=> (?::vector), dc.created_at DESC) AS ann_rank " +
                        "FROM document_chunks dc " +
                        "JOIN documents d ON d.id = dc.document_id " +
                        "WHERE (? = true OR d.owner_id = ?) " +
                        docFilter +
                        "ORDER BY dc.embedding <=> (?::vector), dc.created_at DESC " +
                        "LIMIT ?" +
                        "), merged AS (" +
                        "SELECT " +
                        "COALESCE(f.document_id, a.document_id) AS document_id, " +
                        "COALESCE(f.title, a.title) AS title, " +
                        "COALESCE(f.chunk_id, a.chunk_id) AS chunk_id, " +
                        "COALESCE(f.chunk_text, a.chunk_text) AS chunk_text, " +
                        "f.fts_rank AS fts_rank, " +
                        "a.ann_rank AS ann_rank " +
                        "FROM fts_candidates f " +
                        "FULL OUTER JOIN ann_candidates a ON a.chunk_id = f.chunk_id" +
                        ") " +
                        "SELECT m.document_id AS document_id, m.title AS title, m.chunk_id AS chunk_id, m.chunk_text AS chunk_text, " +
                        "(COALESCE(1.0 / (? + m.fts_rank), 0.0) + COALESCE(1.0 / (? + m.ann_rank), 0.0)) AS score " +
                        "FROM merged m " +
                        "ORDER BY score DESC " +
                        "LIMIT ?";

        var args = new java.util.ArrayList<>();
        args.add(query);
        args.add(isAdmin);
        args.add(actorId);
        if (documentIds != null && !documentIds.isEmpty()) {
            args.addAll(documentIds);
        }
        args.add(query);
        args.add(query);
        args.add(candidateLimit);
        args.add(qVec);
        args.add(isAdmin);
        args.add(actorId);
        if (documentIds != null && !documentIds.isEmpty()) {
            args.addAll(documentIds);
        }
        args.add(qVec);
        args.add(candidateLimit);
        args.add(RRF_K);
        args.add(RRF_K);
        args.add(limit);

        return jdbcTemplate.query(sql, (rs, rowNum) -> new ChunkHit(
                rs.getString("document_id"),
                rs.getString("title"),
                rs.getString("chunk_id"),
                rs.getString("chunk_text"),
                rs.getDouble("score")
        ), args.toArray());
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

