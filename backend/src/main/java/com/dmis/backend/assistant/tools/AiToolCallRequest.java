package com.dmis.backend.assistant.tools;

import java.util.Map;

public record AiToolCallRequest(
        String name,
        Map<String, Object> arguments,
        String traceId
) {
}
