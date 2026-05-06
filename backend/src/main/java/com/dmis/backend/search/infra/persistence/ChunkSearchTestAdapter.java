package com.dmis.backend.search.infra.persistence;

import com.dmis.backend.search.application.port.ChunkSearchPort;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;
import java.util.Locale;

@Component
@Profile("test")
public class ChunkSearchTestAdapter implements ChunkSearchPort {
    private final JdbcTemplate jdbcTemplate;

    public ChunkSearchTestAdapter(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public List<ChunkHit> search(String actorId, boolean isAdmin, String query, int limit, List<String> documentIds) {
        String q = query == null ? "" : query.toLowerCase(Locale.ROOT).trim();
        List<String> tokens = q.isEmpty() ? List.of() : Arrays.asList(q.split("\\s+"));

        String sql =
                "SELECT d.id AS document_id, d.title AS title, dc.id AS chunk_id, dc.chunk_text AS chunk_text " +
                        "FROM document_chunks dc " +
                        "JOIN documents d ON d.id = dc.document_id " +
                        "WHERE (? = true OR d.owner_id = ?) " +
                        ((documentIds == null || documentIds.isEmpty()) ? "" : "AND d.id IN (" + String.join(",", documentIds.stream().map(id -> "?").toList()) + ") ") +
                        "ORDER BY dc.created_at DESC " +
                        "LIMIT ?";
        var args = new java.util.ArrayList<>();
        args.add(isAdmin);
        args.add(actorId);
        if (documentIds != null && !documentIds.isEmpty()) {
            args.addAll(documentIds);
        }
        args.add(Math.max(limit * 5, limit));

        List<ChunkHit> raw = jdbcTemplate.query(sql, (rs, rowNum) -> new ChunkHit(
                rs.getString("document_id"),
                rs.getString("title"),
                rs.getString("chunk_id"),
                rs.getString("chunk_text"),
                0.0
        ), args.toArray());

        return raw.stream()
                .map(hit -> new ChunkHit(
                        hit.documentId(),
                        hit.title(),
                        hit.chunkId(),
                        hit.chunkText(),
                        lexicalScore(tokens, hit.chunkText())
                ))
                .sorted((a, b) -> Double.compare(b.score(), a.score()))
                .limit(limit)
                .toList();
    }

    private static double lexicalScore(List<String> tokens, String text) {
        if (tokens.isEmpty() || text == null) {
            return 0.0;
        }
        String lower = text.toLowerCase(Locale.ROOT);
        long matches = tokens.stream().filter(t -> !t.isBlank() && lower.contains(t)).count();
        return matches;
    }
}

