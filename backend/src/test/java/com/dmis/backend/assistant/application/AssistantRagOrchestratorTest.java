package com.dmis.backend.assistant.application;

import com.dmis.backend.assistant.application.port.AssistantPort;
import com.dmis.backend.search.application.SearchService;
import com.dmis.backend.search.application.dto.SearchDtos;
import com.dmis.backend.shared.model.RoleName;
import com.dmis.backend.shared.model.UserView;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AssistantRagOrchestratorTest {
    private AssistantPort assistantPort;
    private ContextAssemblyService contextAssemblyService;
    private SearchService searchService;
    private AssistantRagOrchestrator orchestrator;
    private UserView actor;

    @BeforeEach
    void setUp() {
        assistantPort = Mockito.mock(AssistantPort.class);
        contextAssemblyService = Mockito.mock(ContextAssemblyService.class);
        searchService = Mockito.mock(SearchService.class);
        orchestrator = new AssistantRagOrchestrator(assistantPort, contextAssemblyService, searchService);
        actor = new UserView("u-admin", "sokolov-d-a@example.com", "Admin", Set.of(RoleName.ADMIN));
    }

    @Test
    void prepareStreamReturnsUnsupportedDiagnosticForNonDocumentSources() {
        SearchService.PreparedAnswer prepared = new SearchService.PreparedAnswer(
                "question",
                KnowledgeSourcePolicy.STATUS_KNOWLEDGE_SOURCE_UNSUPPORTED,
                KnowledgeSourcePolicy.unsupportedMessage(),
                List.of(),
                List.of(),
                new SearchDtos.AnswerPipelineMeta(0, 0, 0, 0, 0, 0, 0, 0, false, 0L, 0L, null, 0L),
                "prompt",
                "rag-test"
        );
        when(searchService.prepareAnswer(eq(actor), eq("question"), eq("rag.answer.stream"), any()))
                .thenReturn(prepared);

        AssistantRagOrchestrator.RagStreamPlan plan = orchestrator.prepareStream(
                actor,
                "thread-1",
                "question",
                List.of("doc-1"),
                List.of("mail"),
                "balanced",
                "rag.answer.stream"
        );

        assertTrue(plan.diagnosticOnly());
        assertEquals(KnowledgeSourcePolicy.STATUS_KNOWLEDGE_SOURCE_UNSUPPORTED, plan.preparedAnswer().status());
        verify(contextAssemblyService, never()).prepareDocumentContext(any(), any(), any(), any());
    }
}
