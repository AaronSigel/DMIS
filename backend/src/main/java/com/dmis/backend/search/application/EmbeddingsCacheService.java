package com.dmis.backend.search.application;

import com.dmis.backend.documents.application.port.EmbeddingsPort;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EmbeddingsCacheService {
    private final EmbeddingsPort embeddingsPort;

    public EmbeddingsCacheService(EmbeddingsPort embeddingsPort) {
        this.embeddingsPort = embeddingsPort;
    }

    @Cacheable(value = "query-embeddings", key = "#query", condition = "#query != null")
    public float[] embedQuery(String query) {
        return embeddingsPort.embed(List.of(query)).getFirst();
    }
}
