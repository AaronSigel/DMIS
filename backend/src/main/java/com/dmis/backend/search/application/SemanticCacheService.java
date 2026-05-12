package com.dmis.backend.search.application;

import com.dmis.backend.search.application.dto.SearchDtos;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;

@Service
public class SemanticCacheService {
    private static final Logger log = LoggerFactory.getLogger(SemanticCacheService.class);
    private static final double SIMILARITY_THRESHOLD = 0.95;
    private static final int CACHE_TTL_DAYS = 7;

    private final JdbcTemplate jdbcTemplate;
    private final EmbeddingsCacheService embeddingsCacheService;
    private final ObjectMapper objectMapper;

    @Value("${search.semantic-cache.enabled:true}")
    private boolean semanticCacheEnabled;

    public SemanticCacheService(
            JdbcTemplate jdbcTemplate,
            EmbeddingsCacheService embeddingsCacheService,
            ObjectMapper objectMapper
    ) {
        this.jdbcTemplate = jdbcTemplate;
        this.embeddingsCacheService = embeddingsCacheService;
        this.objectMapper = objectMapper;
    }

    public Optional<CachedAnswer> findSimilarAnswer(String question, List<String> contextChunkIds) {
        if (!semanticCacheEnabled) {
            return Optional.empty();
        }
        String contextFingerprint = computeFingerprint(contextChunkIds);
        float[] questionEmbedding = embeddingsCacheService.embedQuery(question);
        String qVec = toVectorLiteral(questionEmbedding);

        String sql = """
                SELECT id, question_text, answer, provider, model, sources, access_count
                FROM llm_cache
                WHERE context_fingerprint = ?
                  AND created_at > NOW() - INTERVAL '%d days'
                  AND (question_embedding <=> (?::vector)) < ?
                ORDER BY question_embedding <=> (?::vector)
                LIMIT 1
                """.formatted(CACHE_TTL_DAYS);

        double distanceThreshold = 1.0 - SIMILARITY_THRESHOLD;

        List<CachedAnswer> results = jdbcTemplate.query(
                sql,
                (rs, rowNum) -> {
                    try {
                        List<SearchDtos.RagSourceView> sources = objectMapper.readValue(
                                rs.getString("sources"),
                                objectMapper.getTypeFactory().constructCollectionType(List.class, SearchDtos.RagSourceView.class)
                        );
                        return new CachedAnswer(
                                rs.getString("id"),
                                rs.getString("question_text"),
                                rs.getString("answer"),
                                rs.getString("provider"),
                                rs.getString("model"),
                                sources,
                                rs.getInt("access_count")
                        );
                    } catch (JsonProcessingException e) {
                        throw new RuntimeException("Failed to parse cached sources", e);
                    }
                },
                contextFingerprint,
                qVec,
                distanceThreshold,
                qVec
        );

        if (!results.isEmpty()) {
            CachedAnswer cached = results.get(0);
            updateAccessStats(cached.id());
            return Optional.of(cached);
        }

        return Optional.empty();
    }

    public void cacheAnswer(
            String question,
            List<String> contextChunkIds,
            String answer,
            String provider,
            String model,
            List<SearchDtos.RagSourceView> sources
    ) {
        if (!semanticCacheEnabled) {
            return;
        }
        String id = "llm-cache-" + UUID.randomUUID();
        String contextFingerprint = computeFingerprint(contextChunkIds);
        float[] questionEmbedding = embeddingsCacheService.embedQuery(question);
        String qVec = toVectorLiteral(questionEmbedding);

        try {
            String sourcesJson = objectMapper.writeValueAsString(sources);

            String sql = """
                    INSERT INTO llm_cache (id, question_text, question_embedding, context_fingerprint, answer, provider, model, sources, created_at, accessed_at, access_count)
                    VALUES (?, ?, ?::vector, ?, ?, ?, ?, ?::jsonb, ?, ?, 1)
                    """;

            Instant now = Instant.now();
            jdbcTemplate.update(
                    sql,
                    id,
                    question,
                    qVec,
                    contextFingerprint,
                    answer,
                    provider,
                    model,
                    sourcesJson,
                    now,
                    now
            );
        } catch (JsonProcessingException e) {
            // Не критично, просто не кэшируем
        }
    }

    private void updateAccessStats(String cacheId) {
        String sql = """
                UPDATE llm_cache
                SET accessed_at = ?,
                    access_count = access_count + 1
                WHERE id = ?
                """;
        jdbcTemplate.update(sql, Instant.now(), cacheId);
    }

    public void cleanupOldEntries() {
        if (!semanticCacheEnabled) {
            return;
        }
        String sql = "DELETE FROM llm_cache WHERE created_at < NOW() - INTERVAL '%d days'".formatted(CACHE_TTL_DAYS);
        int deleted = jdbcTemplate.update(sql);
        if (deleted > 0) {
            log.info("Cleaned up {} old LLM cache entries", deleted);
        }
    }

    private String computeFingerprint(List<String> chunkIds) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            String concatenated = String.join(",", chunkIds.stream().sorted().toList());
            byte[] hash = digest.digest(concatenated.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 not available", e);
        }
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

    public record CachedAnswer(
            String id,
            String questionText,
            String answer,
            String provider,
            String model,
            List<SearchDtos.RagSourceView> sources,
            int accessCount
    ) {
    }
}
