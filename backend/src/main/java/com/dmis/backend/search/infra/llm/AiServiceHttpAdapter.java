package com.dmis.backend.search.infra.llm;

import com.dmis.backend.search.application.port.LlmChatPort;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.io.InputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

@Component
public class AiServiceHttpAdapter implements LlmChatPort {
    private final RestClient restClient;
    private final URI baseUri;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public AiServiceHttpAdapter(
            @Value("${AI_BASE_URL:http://localhost:8002}") String baseUrl,
            ObjectMapper objectMapper
    ) {
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .build();
        this.baseUri = URI.create(baseUrl);
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
        this.objectMapper = objectMapper;
    }

    @Override
    public ChatResponse chat(ChatRequest request) {
        ChatResponse response = restClient.post()
                .uri("/chat")
                .body(request)
                .retrieve()
                .body(ChatResponse.class);

        if (response == null || response.answer() == null || response.answer().isBlank()) {
            throw new IllegalStateException("AI service returned empty response");
        }
        return response;
    }

    @Override
    public InputStream chatStream(ChatRequest request) {
        try {
            URI uri = baseUri.resolve("/chat/stream");
            String body = objectMapper.writeValueAsString(request);

            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(uri)
                    .timeout(Duration.ofMinutes(5))
                    .header("Accept", "text/event-stream")
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();

            HttpResponse<InputStream> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofInputStream());
            int code = response.statusCode();
            if (code < 200 || code >= 300) {
                try (InputStream is = response.body()) {
                    byte[] bytes = is.readAllBytes();
                    String msg = new String(bytes);
                    throw new IllegalStateException("AI service stream failed: HTTP " + code + " " + msg);
                }
            }
            return response.body();
        } catch (Exception e) {
            throw new IllegalStateException("AI service stream failed", e);
        }
    }
}
