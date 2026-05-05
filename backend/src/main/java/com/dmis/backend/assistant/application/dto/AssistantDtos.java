package com.dmis.backend.assistant.application.dto;

import com.dmis.backend.search.application.dto.SearchDtos;

import java.time.Instant;
import java.util.List;

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

    public record SendMessageResult(
            MessageView userMessage,
            MessageView assistantMessage,
            SearchDtos.AnswerWithSourcesResponse rag
    ) {
    }
}
