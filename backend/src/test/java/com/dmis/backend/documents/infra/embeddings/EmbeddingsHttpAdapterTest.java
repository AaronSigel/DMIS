package com.dmis.backend.documents.infra.embeddings;

import com.dmis.backend.integrations.infra.http.retry.HttpRetryHelper;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.client.RestClient;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class EmbeddingsHttpAdapterTest {
    private HttpServer server;
    private final AtomicInteger requests = new AtomicInteger();

    @AfterEach
    void tearDown() {
        if (server != null) {
            server.stop(0);
        }
    }

    @Test
    void embedParsesEmbeddingsResponse() throws Exception {
        server = HttpServer.create(new InetSocketAddress(0), 0);
        server.createContext("/embed", this::handleEmbed);
        server.start();

        String baseUrl = "http://localhost:" + server.getAddress().getPort();
        EmbeddingsHttpAdapter adapter = createAdapter(baseUrl);

        List<float[]> vectors = adapter.embed(List.of("hello"));
        assertEquals(1, vectors.size());
        assertFalse(vectors.getFirst().length == 0);
        assertEquals(0.125f, vectors.getFirst()[0], 0.00001f);
    }

    @Test
    void embedRejectsNon1024Dimension() throws Exception {
        server = HttpServer.create(new InetSocketAddress(0), 0);
        server.createContext("/embed", this::handleEmbedWrongDimension);
        server.start();

        String baseUrl = "http://localhost:" + server.getAddress().getPort();
        EmbeddingsHttpAdapter adapter = createAdapter(baseUrl);

        assertThrows(IllegalStateException.class, () -> adapter.embed(List.of("hello")));
    }

    @Test
    void embedRetriesOn5xxAndSucceeds() throws Exception {
        server = HttpServer.create(new InetSocketAddress(0), 0);
        server.createContext("/embed", this::handleEmbedFailsTwiceThenSucceeds);
        server.start();

        String baseUrl = "http://localhost:" + server.getAddress().getPort();
        EmbeddingsHttpAdapter adapter = createAdapter(baseUrl);

        List<float[]> vectors = adapter.embed(List.of("hello"));
        assertEquals(1, vectors.size());
        assertEquals(3, requests.get(), "expected two retries before success");
    }

    @Test
    void embedFailsAfterRetryExhaustedOn5xx() throws Exception {
        server = HttpServer.create(new InetSocketAddress(0), 0);
        server.createContext("/embed", this::handleEmbedAlwaysServerError);
        server.start();

        String baseUrl = "http://localhost:" + server.getAddress().getPort();
        EmbeddingsHttpAdapter adapter = createAdapter(baseUrl);

        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> adapter.embed(List.of("hello")));
        assertEquals(3, requests.get(), "expected exactly max-attempts calls");
        assertTrue(ex.getMessage().contains("after 3 attempts"));
    }

    @Test
    void embedDoesNotRetryOn4xx() throws Exception {
        server = HttpServer.create(new InetSocketAddress(0), 0);
        server.createContext("/embed", this::handleEmbedBadRequest);
        server.start();

        String baseUrl = "http://localhost:" + server.getAddress().getPort();
        EmbeddingsHttpAdapter adapter = createAdapter(baseUrl);

        assertThrows(RuntimeException.class, () -> adapter.embed(List.of("hello")));
        assertEquals(1, requests.get(), "expected no retries for 4xx");
    }

    private void handleEmbed(HttpExchange exchange) throws IOException {
        requests.incrementAndGet();
        List<Double> row = new ArrayList<>(1024);
        row.add(0.125);
        for (int i = 1; i < 1024; i++) {
            row.add(0.0);
        }
        String bodyString = "{\"model\":\"/models/bge-m3\",\"dimension\":1024,\"embeddings\":[" + toJsonArray(row) + "]}";
        byte[] body = bodyString.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().add("Content-Type", "application/json");
        exchange.sendResponseHeaders(200, body.length);
        try (var os = exchange.getResponseBody()) {
            os.write(body);
        }
    }

    private void handleEmbedWrongDimension(HttpExchange exchange) throws IOException {
        requests.incrementAndGet();
        byte[] body = """
                {"model":"/models/bge-m3","dimension":768,"embeddings":[[0.125,0.0,0.0]]}
                """.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().add("Content-Type", "application/json");
        exchange.sendResponseHeaders(200, body.length);
        try (var os = exchange.getResponseBody()) {
            os.write(body);
        }
    }

    private void handleEmbedFailsTwiceThenSucceeds(HttpExchange exchange) throws IOException {
        int call = requests.incrementAndGet();
        if (call <= 2) {
            byte[] body = "{\"detail\":\"temporary embeddings failure\"}".getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().add("Content-Type", "application/json");
            exchange.sendResponseHeaders(503, body.length);
            try (var os = exchange.getResponseBody()) {
                os.write(body);
            }
            return;
        }
        List<Double> row = new ArrayList<>(1024);
        row.add(0.125);
        for (int i = 1; i < 1024; i++) {
            row.add(0.0);
        }
        String bodyString = "{\"model\":\"/models/bge-m3\",\"dimension\":1024,\"embeddings\":[" + toJsonArray(row) + "]}";
        byte[] body = bodyString.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().add("Content-Type", "application/json");
        exchange.sendResponseHeaders(200, body.length);
        try (var os = exchange.getResponseBody()) {
            os.write(body);
        }
    }

    private void handleEmbedAlwaysServerError(HttpExchange exchange) throws IOException {
        requests.incrementAndGet();
        byte[] body = "{\"detail\":\"embeddings unavailable\"}".getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().add("Content-Type", "application/json");
        exchange.sendResponseHeaders(503, body.length);
        try (var os = exchange.getResponseBody()) {
            os.write(body);
        }
    }

    private void handleEmbedBadRequest(HttpExchange exchange) throws IOException {
        requests.incrementAndGet();
        byte[] body = "{\"detail\":\"bad request\"}".getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().add("Content-Type", "application/json");
        exchange.sendResponseHeaders(400, body.length);
        try (var os = exchange.getResponseBody()) {
            os.write(body);
        }
    }

    private static String toJsonArray(List<Double> row) {
        StringBuilder sb = new StringBuilder();
        sb.append('[');
        for (int i = 0; i < row.size(); i++) {
            if (i > 0) {
                sb.append(',');
            }
            sb.append(row.get(i));
        }
        sb.append(']');
        return sb.toString();
    }

    private static EmbeddingsHttpAdapter createAdapter(String baseUrl) {
        HttpRetryHelper retryHelper = HttpRetryHelper.forTests(3, 1, 2, 2.0d);
        RestClient restClient = RestClient.builder().baseUrl(baseUrl).build();
        return new EmbeddingsHttpAdapter(retryHelper, restClient);
    }
}

