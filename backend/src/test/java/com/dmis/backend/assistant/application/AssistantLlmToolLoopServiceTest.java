package com.dmis.backend.assistant.application;

import com.dmis.backend.assistant.tools.AiToolCallRequest;
import com.dmis.backend.assistant.tools.AiToolCallResult;
import com.dmis.backend.assistant.tools.AiToolDefinition;
import com.dmis.backend.assistant.tools.AiToolGateway;
import com.dmis.backend.audit.application.AuditService;
import com.dmis.backend.audit.application.dto.AuditView;
import com.dmis.backend.audit.application.port.AuditPort;
import com.dmis.backend.search.application.port.LlmChatPort;
import com.dmis.backend.shared.model.RoleName;
import com.dmis.backend.shared.model.UserView;
import com.dmis.backend.shared.security.AclService;
import com.dmis.backend.documents.application.port.DocumentAccessPort;
import com.dmis.backend.documents.domain.DocumentAccessLevel;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AssistantLlmToolLoopServiceTest {
    private AiToolGateway aiToolGateway;
    private LlmChatPort llmChatPort;
    private AssistantLlmToolLoopService service;
    private UserView actor;

    @BeforeEach
    void setUp() {
        aiToolGateway = mock(AiToolGateway.class);
        llmChatPort = mock(LlmChatPort.class);
        AuditService auditService = new AuditService(new NoopAuditPort(), new AclService(noopAccessPort()));
        service = new AssistantLlmToolLoopService(
                aiToolGateway,
                llmChatPort,
                auditService,
                new ObjectMapper(),
                2,
                0
        );
        actor = new UserView("u-admin", "sokolov-d-a@example.com", "Admin", Set.of(RoleName.ADMIN));
        when(aiToolGateway.listTools(actor)).thenReturn(List.of(
                new AiToolDefinition(
                        "documents.search",
                        "Поиск",
                        "Ищет документы",
                        Map.of("type", "object"),
                        true,
                        false
                )
        ));
    }

    @Test
    void completeWithToolsReturnsDirectAnswerWhenNoToolCalls() {
        when(llmChatPort.chat(any())).thenReturn(new LlmChatPort.ChatResponse("Готовый ответ", "fake", "test"));

        LlmChatPort.ChatResponse response = service.completeWithTools(
                actor,
                "question",
                List.of("chunk"),
                "system",
                "rag-1"
        );

        assertEquals("Готовый ответ", response.answer());
        verify(llmChatPort, times(1)).chat(any());
        verify(aiToolGateway, times(0)).call(any(), any());
    }

    @Test
    void completeWithToolsExecutesToolCallAndReturnsFinalAnswer() {
        when(llmChatPort.chat(any()))
                .thenReturn(new LlmChatPort.ChatResponse(
                        "",
                        "fake",
                        "test",
                        List.of(new LlmChatPort.ToolCall("call-1", "documents.search", "{\"query\":\"policy\"}"))
                ))
                .thenReturn(new LlmChatPort.ChatResponse("Ответ после tool", "fake", "test"));
        when(aiToolGateway.call(any(), any())).thenReturn(new AiToolCallResult(
                "documents.search",
                true,
                "OK",
                null,
                Map.of("hits", List.of())
        ));

        LlmChatPort.ChatResponse response = service.completeWithTools(
                actor,
                "question",
                List.of("chunk"),
                "system",
                "rag-2"
        );

        assertEquals("Ответ после tool", response.answer());
        verify(aiToolGateway).call(any(), any(AiToolCallRequest.class));
        ArgumentCaptor<LlmChatPort.ChatRequest> captor = ArgumentCaptor.forClass(LlmChatPort.ChatRequest.class);
        verify(llmChatPort, times(2)).chat(captor.capture());
        assertTrue(captor.getAllValues().get(1).toolResults().stream()
                .anyMatch(result -> "call-1".equals(result.toolCallId())));
    }

    private static DocumentAccessPort noopAccessPort() {
        return new DocumentAccessPort() {
            @Override
            public Optional<DocumentAccessLevel> findLevel(String documentId, String principalId) {
                return Optional.empty();
            }

            @Override
            public List<String> findAccessibleDocumentIds(String principalId) {
                return List.of();
            }
        };
    }

    private static final class NoopAuditPort implements AuditPort {
        @Override
        public void append(AuditView auditView) {
        }

        @Override
        public List<AuditView> findAll() {
            return List.of();
        }

        @Override
        public List<AuditView> findByActorId(String actorId) {
            return List.of();
        }
    }
}
