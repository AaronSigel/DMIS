package com.dmis.backend.assistant.tools;

import java.util.Map;

public record AiToolDefinition(
        String name,
        String title,
        String description,
        Map<String, Object> inputSchema,
        boolean readOnly,
        boolean requiresConfirmation
) {
}
