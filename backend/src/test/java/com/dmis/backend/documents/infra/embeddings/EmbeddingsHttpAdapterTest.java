package com.dmis.backend.documents.infra.embeddings;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

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

    private void handleEmbed(HttpExchange exchange) throws IOException {
        byte[] body = """
                {"model":"/models/bge-m3","dimension":1024,"embeddings":[[0.125,0.0,0.0]]}
                """.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().add("Content-Type", "application/json");
        exchange.sendResponseHeaders(200, body.length);
        try (var os = exchange.getResponseBody()) {
            os.write(body);
        }
    }
}

