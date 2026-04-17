package com.dmis.backend.search.application.port;

import java.io.InputStream;
import java.util.List;

public interface LlmChatPort {
    ChatResponse chat(ChatRequest request);

    InputStream chatStream(ChatRequest request);

    record ChatRequest(
            String question,
            List<String> contextChunks,
            String systemPrompt,
            Double temperature,
            Integer maxTokens,
            String traceId
    ) {
    }

    record ChatResponse(
            String answer,
            String provider,
            String model
    ) {
    }
}
