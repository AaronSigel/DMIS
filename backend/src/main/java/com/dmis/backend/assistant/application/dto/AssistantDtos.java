package com.dmis.backend.assistant.application.dto;

import com.dmis.backend.search.application.dto.SearchDtos;

import java.time.Instant;
import java.util.List;
import java.util.Objects;

public final class AssistantDtos {
    private AssistantDtos() {
    }

    public record ThreadView(
            String id,
            String ownerId,
            String title,
            String ideologyProfileId,
            List<String> knowledgeSourceIds,
            Instant createdAt,
            Instant updatedAt
    ) {
    }

    public record MessageView(
            String id,
            String threadId,
            String role,
            String content,
            List<String> documentIds,
            Instant createdAt
    ) {
    }

    public record ThreadDetailView(
            ThreadView thread,
            List<MessageView> messages,
            List<String> linkedDocumentIds
    ) {
    }

    public record MentionDocumentView(
            String id,
            String title,
            Instant updatedAt
    ) {
    }

    public record AssistantPreferencesView(
            String ownerId,
            String ideologyProfileId,
            List<String> knowledgeSourceIds,
            Instant updatedAt
    ) {
    }

    public record AssistantDocumentStatusView(
            String documentId,
            String title,
            String fileName,
            String status,
            int indexedChunkCount,
            int extractedTextLength,
            Instant indexedAt,
            String diagnosticCode,
            String diagnosticMessage
    ) {
    }

    public record SendMessageResult(
            MessageView userMessage,
            MessageView assistantMessage,
            SearchDtos.AnswerWithSourcesResponse rag,
            String contextStatus,
            String contextDiagnosticCode,
            List<AssistantDocumentStatusView> contextDocuments
    ) {
        public SendMessageResult {
            contextDocuments = contextDocuments == null ? List.of() : List.copyOf(contextDocuments);
        }

        public SendMessageResult(
                MessageView userMessage,
                MessageView assistantMessage,
                SearchDtos.AnswerWithSourcesResponse rag
        ) {
            this(userMessage, assistantMessage, rag, null, null, List.of());
        }

        public SendMessageResult withContext(
                String contextStatus,
                String contextDiagnosticCode,
                List<AssistantDocumentStatusView> contextDocuments
        ) {
            return new SendMessageResult(
                    userMessage,
                    assistantMessage,
                    rag,
                    contextStatus,
                    contextDiagnosticCode,
                    Objects.requireNonNullElse(contextDocuments, List.of())
            );
        }
    }

    public record AiToolDefinitionView(
            String name,
            String title,
            String description,
            java.util.Map<String, Object> inputSchema,
            boolean readOnly,
            boolean requiresConfirmation
    ) {
    }

    public record AiToolCallResultView(
            String name,
            boolean success,
            String status,
            String message,
            java.util.Map<String, Object> structuredContent
    ) {
    }

    public record SubmitStreamPayload(
            String question,
            String threadId,
            List<String> documentIds,
            List<String> knowledgeSourceIds,
            String ideologyProfileId
    ) {
    }

    public record SubmitRequestResult(
            String route,
            String traceId,
            com.dmis.backend.actions.application.dto.ActionDtos.AiActionView action,
            String streamUrl,
            SubmitStreamPayload streamPayload,
            String status,
            String diagnosticCode,
            String message,
            List<AssistantDocumentStatusView> contextDocuments
    ) {
        public SubmitRequestResult {
            contextDocuments = contextDocuments == null ? List.of() : List.copyOf(contextDocuments);
        }
    }
}
