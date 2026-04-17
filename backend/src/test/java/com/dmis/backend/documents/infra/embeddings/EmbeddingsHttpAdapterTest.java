package com.dmis.backend.documents.infra.embeddings;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;

class EmbeddingsHttpAdapterTest {
    private HttpServer server;

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
        EmbeddingsHttpAdapter adapter = new EmbeddingsHttpAdapter(baseUrl);

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
        EmbeddingsHttpAdapter adapter = new EmbeddingsHttpAdapter(baseUrl);

        assertThrows(IllegalStateException.class, () -> adapter.embed(List.of("hello")));
    }

    private void handleEmbed(HttpExchange exchange) throws IOException {
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
        byte[] body = """
                {"model":"/models/bge-m3","dimension":768,"embeddings":[[0.125,0.0,0.0]]}
                """.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().add("Content-Type", "application/json");
        exchange.sendResponseHeaders(200, body.length);
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
}

