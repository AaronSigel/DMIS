package com.dmis.backend.search.application;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

@Component
public class RagStreamEventParser {
    private final ObjectMapper objectMapper;

    public RagStreamEventParser(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public ParsedEvent parse(String json) {
        try {
            JsonNode node = objectMapper.readTree(json);
            String delta = text(node.get("delta"));
            boolean done = booleanValue(node.get("done"));
            String provider = text(node.get("provider"));
            String model = text(node.get("model"));
            return new ParsedEvent(delta, done, provider, model);
        } catch (Exception ignored) {
            return ParsedEvent.empty();
        }
    }

    private static String text(JsonNode node) {
        return node != null && node.isTextual() ? node.asText() : null;
    }

    private static boolean booleanValue(JsonNode node) {
        return node != null && node.isBoolean() && node.asBoolean();
    }

    public record ParsedEvent(String delta, boolean done, String provider, String model) {
        private static ParsedEvent empty() {
            return new ParsedEvent(null, false, null, null);
        }
    }
}
