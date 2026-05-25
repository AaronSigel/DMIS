package com.dmis.backend.search.application.port;

import java.io.InputStream;
import java.util.List;
import java.util.Map;

public interface LlmChatPort {
    ChatResponse chat(ChatRequest request);

    InputStream chatStream(ChatRequest request);

    record ToolDefinition(
            String name,
            String description,
            Map<String, Object> inputSchema
    ) {
    }

    record ToolCall(
            String id,
            String name,
            String argumentsJson
    ) {
    }

    record ToolResultMessage(
            String toolCallId,
            String content
    ) {
    }

    record ChatRequest(
            String question,
            List<String> contextChunks,
            String systemPrompt,
            Double temperature,
            Integer maxTokens,
            String traceId,
            List<ToolDefinition> tools,
            List<ToolResultMessage> toolResults
    ) {
        public ChatRequest(
                String question,
                List<String> contextChunks,
                String systemPrompt,
                Double temperature,
                Integer maxTokens,
                String traceId
        ) {
            this(question, contextChunks, systemPrompt, temperature, maxTokens, traceId, List.of(), List.of());
        }

        public ChatRequest {
            if (tools == null) {
                tools = List.of();
            }
            if (toolResults == null) {
                toolResults = List.of();
            }
        }
    }

    record ChatResponse(
            String answer,
            String provider,
            String model,
            List<ToolCall> toolCalls
    ) {
        public ChatResponse(String answer, String provider, String model) {
            this(answer, provider, model, List.of());
        }

        public ChatResponse {
            if (answer == null) {
                answer = "";
            }
            if (toolCalls == null) {
                toolCalls = List.of();
            }
        }
    }
}
