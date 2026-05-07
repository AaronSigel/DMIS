package com.dmis.backend.search.infra.llm;

import com.dmis.backend.integrations.infra.http.retry.HttpRetryHelper;
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
    private final long streamTimeoutMs;
    private final HttpRetryHelper httpRetryHelper;

    public AiServiceHttpAdapter(
            @Value("${AI_BASE_URL:http://localhost:8002}") String baseUrl,
            @Value("${ai.stream.timeout-ms:0}") long streamTimeoutMs,
            HttpRetryHelper httpRetryHelper,
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
        this.streamTimeoutMs = streamTimeoutMs;
        this.httpRetryHelper = httpRetryHelper;
    }

    @Override
    public ChatResponse chat(ChatRequest request) {
        ChatResponse response = httpRetryHelper.execute(
                "AI service /chat",
                () -> restClient.post()
                        .uri("/chat")
                        .body(request)
                        .retrieve()
                        .body(ChatResponse.class),
                HttpRetryHelper::retryOnServerErrorOrTransient
        );

        if (response == null || response.answer() == null || response.answer().isBlank()) {
            throw new IllegalStateException("AI service returned empty response");
        }
        return response;
    }

    @Override
    public InputStream chatStream(ChatRequest request) {
        try {
            return httpRetryHelper.execute(
                    "AI service /chat/stream",
                    () -> {
                        URI uri = baseUri.resolve("/chat/stream");
                        String body = objectMapper.writeValueAsString(request);

                        HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
                                .uri(uri)
                                .header("Accept", "text/event-stream")
                                .header("Content-Type", "application/json")
                                .POST(HttpRequest.BodyPublishers.ofString(body));
                        if (streamTimeoutMs > 0) {
                            requestBuilder.timeout(Duration.ofMillis(streamTimeoutMs));
                        }
                        HttpRequest httpRequest = requestBuilder.build();

                        HttpResponse<InputStream> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofInputStream());
                        int code = response.statusCode();
                        if (code < 200 || code >= 300) {
                            try (InputStream is = response.body()) {
                                byte[] bytes = is.readAllBytes();
                                String msg = new String(bytes);
                                if (code >= 500) {
                                    throw new RetryableHttpStatusException(code, msg);
                                }
                                throw new IllegalStateException("AI service stream failed: HTTP " + code + " " + msg);
                            }
                        }
                        return response.body();
                    },
                    throwable -> HttpRetryHelper.retryOnServerErrorOrTransient(throwable)
                            || throwable instanceof RetryableHttpStatusException
            );
        } catch (RuntimeException e) {
            throw new IllegalStateException("AI service stream failed", e);
        } catch (Exception e) {
            if (e instanceof InterruptedException) {
                Thread.currentThread().interrupt();
                throw new IllegalStateException("AI service stream interrupted", e);
            }
            throw new IllegalStateException("AI service stream failed", e);
        }
    }

    private static final class RetryableHttpStatusException extends RuntimeException {
        private final int status;

        private RetryableHttpStatusException(int status, String body) {
            super("HTTP " + status + " " + body);
            this.status = status;
        }

        public int status() {
            return status;
        }
    }
}
