package com.dmis.backend.search.infra.rerank;

import com.dmis.backend.search.application.port.ChunkRerankPort;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;

@Component
public class EmbeddingsRerankHttpAdapter implements ChunkRerankPort {
    private final RestClient restClient;

    public EmbeddingsRerankHttpAdapter(@Value("${EMBEDDINGS_BASE_URL:http://localhost:8001}") String baseUrl) {
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .build();
    }

    @Override
    public List<RerankScore> rerank(String query, List<Candidate> candidates) {
        RerankResponse response = restClient.post()
                .uri("/rerank")
                .body(new RerankRequest(
                        query,
                        candidates.stream().map(Candidate::chunkText).toList(),
                        candidates.size()
                ))
                .retrieve()
                .body(RerankResponse.class);

        if (response == null || response.results == null) {
            throw new IllegalStateException("Embeddings reranker returned empty response");
        }

        return response.results.stream()
                .map(item -> {
                    if (item.index < 0 || item.index >= candidates.size()) {
                        throw new IllegalStateException("Embeddings reranker returned invalid candidate index: " + item.index);
                    }
                    String chunkId = candidates.get(item.index).chunkId();
                    return new RerankScore(chunkId, item.score);
                })
                .toList();
    }

    private record RerankRequest(String query, List<String> candidates, Integer topN) {
    }

    @SuppressWarnings("unused")
    private static final class RerankResponse {
        public String model;
        public List<RerankItem> results;
    }

    @SuppressWarnings("unused")
    private static final class RerankItem {
        public int index;
        public double score;
    }
}

