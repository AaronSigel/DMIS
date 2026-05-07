package com.dmis.backend.documents.infra.embeddings;

import com.dmis.backend.documents.application.port.EmbeddingsPort;
import com.dmis.backend.integrations.infra.http.retry.HttpRetryHelper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.List;

@Component
public class EmbeddingsHttpAdapter implements EmbeddingsPort {
    private static final int EXPECTED_DIMENSION = 1024;
    private final RestClient restClient;
    private final HttpRetryHelper httpRetryHelper;

    @Autowired
    public EmbeddingsHttpAdapter(
            @Value("${EMBEDDINGS_BASE_URL:http://localhost:8001}") String baseUrl,
            HttpRetryHelper httpRetryHelper
    ) {
        this(httpRetryHelper, RestClient.builder().baseUrl(baseUrl).build());
    }

    EmbeddingsHttpAdapter(
            HttpRetryHelper httpRetryHelper,
            RestClient restClient
    ) {
        this.restClient = restClient;
        this.httpRetryHelper = httpRetryHelper;
    }

    @Override
    public List<float[]> embed(List<String> texts) {
        EmbedResponse response = httpRetryHelper.execute(
                "Embeddings service /embed",
                () -> restClient.post()
                        .uri("/embed")
                        .body(new EmbedRequest(texts, true))
                        .retrieve()
                        .body(EmbedResponse.class),
                HttpRetryHelper::retryOnServerErrorOrTransient
        );

        if (response == null || response.embeddings == null) {
            throw new IllegalStateException("Embeddings service returned empty response");
        }
        if (response.dimension != EXPECTED_DIMENSION) {
            throw new IllegalStateException("Embeddings dimension mismatch: " + response.dimension + " != " + EXPECTED_DIMENSION);
        }

        List<float[]> vectors = new ArrayList<>(response.embeddings.size());
        for (List<Double> row : response.embeddings) {
            if (row.size() != EXPECTED_DIMENSION) {
                throw new IllegalStateException("Embedding row dimension mismatch: " + row.size() + " != " + EXPECTED_DIMENSION);
            }
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

