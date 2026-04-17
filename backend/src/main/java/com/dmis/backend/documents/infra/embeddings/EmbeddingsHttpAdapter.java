package com.dmis.backend.documents.infra.embeddings;

import com.dmis.backend.documents.application.port.EmbeddingsPort;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.List;

@Component
public class EmbeddingsHttpAdapter implements EmbeddingsPort {
    private final RestClient restClient;

    public EmbeddingsHttpAdapter(@Value("${EMBEDDINGS_BASE_URL:http://localhost:8001}") String baseUrl) {
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .build();
    }

    @Override
    public List<float[]> embed(List<String> texts) {
        EmbedResponse response = restClient.post()
                .uri("/embed")
                .body(new EmbedRequest(texts, true))
                .retrieve()
                .body(EmbedResponse.class);

        if (response == null || response.embeddings == null) {
            throw new IllegalStateException("Embeddings service returned empty response");
        }

        List<float[]> vectors = new ArrayList<>(response.embeddings.size());
        for (List<Double> row : response.embeddings) {
            float[] vec = new float[row.size()];
            for (int i = 0; i < row.size(); i++) {
                vec[i] = row.get(i).floatValue();
            }
            vectors.add(vec);
        }
        return vectors;
    }

    private record EmbedRequest(List<String> texts, boolean normalize) {
    }

    @SuppressWarnings("unused")
    private static final class EmbedResponse {
        public String model;
        public int dimension;
        public List<List<Double>> embeddings;
    }
}

