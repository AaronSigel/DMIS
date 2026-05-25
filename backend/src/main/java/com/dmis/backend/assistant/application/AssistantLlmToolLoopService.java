package com.dmis.backend.assistant.application;

import com.dmis.backend.assistant.tools.AiToolCallRequest;
import com.dmis.backend.assistant.tools.AiToolCallResult;
import com.dmis.backend.assistant.tools.AiToolDefinition;
import com.dmis.backend.assistant.tools.AiToolGateway;
import com.dmis.backend.audit.application.AuditService;
import com.dmis.backend.search.application.port.LlmChatPort;
import com.dmis.backend.shared.model.UserView;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@ConditionalOnProperty(name = "assistant.tools.llm-loop-enabled", havingValue = "true")
public class AssistantLlmToolLoopService {
    private final AiToolGateway aiToolGateway;
    private final LlmChatPort llmChatPort;
    private final AuditService auditService;
    private final ObjectMapper objectMapper;
    private final int maxIterations;
    private final int ragMaxTokens;

    public AssistantLlmToolLoopService(
            AiToolGateway aiToolGateway,
            LlmChatPort llmChatPort,
            AuditService auditService,
            ObjectMapper objectMapper,
            @Value("${assistant.tools.max-iterations:2}") int maxIterations,
            @Value("${search.rag.max-tokens:0}") int ragMaxTokens
    ) {
        this.aiToolGateway = aiToolGateway;
        this.llmChatPort = llmChatPort;
        this.auditService = auditService;
        this.objectMapper = objectMapper;
        this.maxIterations = Math.max(1, maxIterations);
        this.ragMaxTokens = ragMaxTokens;
    }

    public LlmChatPort.ChatResponse completeWithTools(UserView actor, String query, List<String> contextChunks, String systemPrompt, String traceId) {
        auditService.append(
                actor.id(),
                "assistant.tool.llm_loop.start",
                "assistant_tool",
                traceId,
                "maxIterations=" + maxIterations
        );

        List<LlmChatPort.ToolDefinition> toolDefinitions = aiToolGateway.listTools(actor).stream()
                .map(this::toToolDefinition)
                .toList();
        List<LlmChatPort.ToolResultMessage> toolResults = new ArrayList<>();
        LlmChatPort.ChatResponse lastResponse = null;

        for (int iteration = 0; iteration < maxIterations; iteration++) {
            lastResponse = llmChatPort.chat(new LlmChatPort.ChatRequest(
                    query,
                    contextChunks,
                    systemPrompt,
                    null,
                    resolveMaxTokens(),
                    traceId,
                    toolDefinitions,
                    toolResults
            ));
            auditService.append(
                    actor.id(),
                    "assistant.tool.llm_loop.iteration",
                    "assistant_tool",
                    traceId,
                    "iteration=" + iteration + ", toolCalls=" + lastResponse.toolCalls().size()
            );

            if (lastResponse.toolCalls().isEmpty()) {
                auditService.append(
                        actor.id(),
                        "assistant.tool.llm_loop.complete",
                        "assistant_tool",
                        traceId,
                        "iterations=" + (iteration + 1)
                );
                return lastResponse;
            }

            toolResults = executeToolCalls(actor, traceId, lastResponse.toolCalls());
        }

        auditService.append(
                actor.id(),
                "assistant.tool.llm_loop.max_iterations_exceeded",
                "assistant_tool",
                traceId,
                "iterations=" + maxIterations
        );

        LlmChatPort.ChatResponse finalResponse = llmChatPort.chat(new LlmChatPort.ChatRequest(
                query,
                contextChunks,
                systemPrompt,
                null,
                resolveMaxTokens(),
                traceId,
                List.of(),
                toolResults
        ));
        auditService.append(
                actor.id(),
                "assistant.tool.llm_loop.complete",
                "assistant_tool",
                traceId,
                "iterations=" + maxIterations + ", forcedFinal=true"
        );
        return finalResponse;
    }

    private Integer resolveMaxTokens() {
        return ragMaxTokens > 0 ? ragMaxTokens : null;
    }

    private List<LlmChatPort.ToolResultMessage> executeToolCalls(
            UserView actor,
            String traceId,
            List<LlmChatPort.ToolCall> toolCalls
    ) {
        List<LlmChatPort.ToolResultMessage> results = new ArrayList<>();
        for (LlmChatPort.ToolCall toolCall : toolCalls) {
            AiToolCallResult result = aiToolGateway.call(
                    actor,
                    new AiToolCallRequest(toolCall.name(), parseArguments(toolCall.argumentsJson()), traceId)
            );
            results.add(new LlmChatPort.ToolResultMessage(toolCall.id(), serializeToolResult(result)));
        }
        return results;
    }

    private LlmChatPort.ToolDefinition toToolDefinition(AiToolDefinition definition) {
        return new LlmChatPort.ToolDefinition(
                definition.name(),
                definition.description(),
                definition.inputSchema() == null ? Map.of() : definition.inputSchema()
        );
    }

    private Map<String, Object> parseArguments(String argumentsJson) {
        if (argumentsJson == null || argumentsJson.isBlank()) {
            return Map.of();
        }
        try {
            return objectMapper.readValue(argumentsJson, new TypeReference<>() {
            });
        } catch (Exception ignored) {
            return Map.of("raw", argumentsJson);
        }
    }

    private String serializeToolResult(AiToolCallResult result) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("success", result.success());
        payload.put("status", result.status());
        payload.put("message", result.message());
        payload.put("structuredContent", result.structuredContent());
        try {
            return objectMapper.writeValueAsString(payload);
        } catch (Exception exception) {
            return "{\"success\":" + result.success() + ",\"status\":\"" + result.status() + "\"}";
        }
    }
}
