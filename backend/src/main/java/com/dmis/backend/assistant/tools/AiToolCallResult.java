package com.dmis.backend.assistant.tools;

import java.util.Map;

public record AiToolCallResult(
        String name,
        boolean success,
        String status,
        String message,
        Map<String, Object> structuredContent
) {
}
