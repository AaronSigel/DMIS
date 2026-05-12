package com.dmis.backend.search.infra.persistence;

import com.dmis.backend.search.application.EmbeddingsCacheService;
import com.dmis.backend.search.application.port.ChunkSearchPort;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Locale;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.stream.Collectors;

@Component
@Profile("!test")
public class ChunkSearchPersistenceAdapter implements ChunkSearchPort {
    private static final int RRF_K = 60;
    private final JdbcTemplate jdbcTemplate;
    private final EmbeddingsCacheService embeddingsCacheService;
    private final ExecutorService searchExecutor;

    public ChunkSearchPersistenceAdapter(JdbcTemplate jdbcTemplate, EmbeddingsCacheService embeddingsCacheService) {
        this.jdbcTemplate = jdbcTemplate;
        this.embeddingsCacheService = embeddingsCacheService;
        this.searchExecutor = Executors.newFixedThreadPool(3);
    }

    @Override
    public List<ChunkHit> search(String actorId, boolean isAdmin, String query, int limit, List<String> documentIds) {
        int candidateLimit = Math.max(limit * 5, limit);
        String docFilter = documentIds == null || documentIds.isEmpty()
                ? ""
                : "AND dc.document_id IN (" + documentIds.stream().map(id -> "?").collect(Collectors.joining(",")) + ") ";

        // Параллельно: embed query + prepare FTS query
        CompletableFuture<float[]> embedFuture = CompletableFuture.supplyAsync(
                () -> embeddingsCacheService.embedQuery(query),
                searchExecutor
        );

        // Ждем embedding для векторного поиска
        float[] embedding = embedFuture.join();
        String qVec = toVectorLiteral(embedding);

        // Параллельно выполняем FTS и ANN поиск
        CompletableFuture<List<ChunkHit>> ftsFuture = CompletableFuture.supplyAsync(() -> {
            String ftsSql = "SELECT dc.id AS chunk_id, dc.document_id AS document_id, d.title AS title, dc.chunk_text AS chunk_text, " +
                    "ROW_NUMBER() OVER (ORDER BY ts_rank_cd(dc.chunk_tsv, plainto_tsquery('simple', ?)) DESC, dc.created_at DESC) AS rank " +
                    "FROM document_chunks dc " +
                    "JOIN documents d ON d.id = dc.document_id " +
                    "WHERE (? = true OR d.owner_id = ?) " +
                    docFilter +
                    "AND dc.chunk_tsv @@ plainto_tsquery('simple', ?) " +
                    "ORDER BY ts_rank_cd(dc.chunk_tsv, plainto_tsquery('simple', ?)) DESC, dc.created_at DESC " +
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

            return jdbcTemplate.query(ftsSql, (rs, rowNum) -> new ChunkHit(
                    rs.getString("document_id"),
                    rs.getString("title"),
                    rs.getString("chunk_id"),
                    rs.getString("chunk_text"),
                    1.0 / (RRF_K + rs.getInt("rank"))
            ), args.toArray());
        }, searchExecutor);

        CompletableFuture<List<ChunkHit>> annFuture = CompletableFuture.supplyAsync(() -> {
            String annSql = "SELECT dc.id AS chunk_id, dc.document_id AS document_id, d.title AS title, dc.chunk_text AS chunk_text, " +
                    "ROW_NUMBER() OVER (ORDER BY dc.embedding <=> (?::vector), dc.created_at DESC) AS rank " +
                    "FROM document_chunks dc " +
                    "JOIN documents d ON d.id = dc.document_id " +
                    "WHERE (? = true OR d.owner_id = ?) " +
                    docFilter +
                    "ORDER BY dc.embedding <=> (?::vector), dc.created_at DESC " +
                    "LIMIT ?";

            var args = new java.util.ArrayList<>();
            args.add(qVec);
            args.add(isAdmin);
            args.add(actorId);
            if (documentIds != null && !documentIds.isEmpty()) {
                args.addAll(documentIds);
            }
            args.add(qVec);
            args.add(candidateLimit);

            return jdbcTemplate.query(annSql, (rs, rowNum) -> new ChunkHit(
                    rs.getString("document_id"),
                    rs.getString("title"),
                    rs.getString("chunk_id"),
                    rs.getString("chunk_text"),
                    1.0 / (RRF_K + rs.getInt("rank"))
            ), args.toArray());
        }, searchExecutor);

        // Ждем оба результата и объединяем
        List<ChunkHit> ftsResults = ftsFuture.join();
        List<ChunkHit> annResults = annFuture.join();

        // Merge с RRF
        return mergeWithRRF(ftsResults, annResults, limit);
    }

    private List<ChunkHit> mergeWithRRF(List<ChunkHit> ftsResults, List<ChunkHit> annResults, int limit) {
        var scoreMap = new java.util.HashMap<String, ChunkHit>();

        // Добавляем FTS результаты
        for (ChunkHit hit : ftsResults) {
            scoreMap.put(hit.chunkId(), hit);
        }

        // Добавляем ANN результаты, суммируя скоры
        for (ChunkHit hit : annResults) {
            scoreMap.merge(hit.chunkId(), hit, (existing, newHit) ->
                    new ChunkHit(
                            existing.documentId(),
                            existing.title(),
                            existing.chunkId(),
                            existing.chunkText(),
                            existing.score() + newHit.score()
                    )
            );
        }

        return scoreMap.values().stream()
                .sorted((a, b) -> Double.compare(b.score(), a.score()))
                .limit(limit)
                .toList();
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
