package com.dmis.backend.search.application;

import com.dmis.backend.audit.application.AuditService;
import com.dmis.backend.audit.application.dto.AuditView;
import com.dmis.backend.audit.application.port.AuditPort;
import com.dmis.backend.search.application.dto.SearchDtos;
import com.dmis.backend.search.application.port.ChunkRerankPort;
import com.dmis.backend.search.application.port.ChunkSearchPort;
import com.dmis.backend.search.application.port.LlmChatPort;
import com.dmis.backend.shared.model.RoleName;
import com.dmis.backend.shared.model.UserView;
import com.dmis.backend.shared.security.AclService;
import org.junit.jupiter.api.Test;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class SearchServiceTest {
    @Test
    void searchUsesRerankScoresWhenAvailable() {
        SearchService service = new SearchService(
                (actorId, isAdmin, query, limit) -> List.of(
                        new ChunkSearchPort.ChunkHit("doc-1", "Doc 1", "v1", "c-1", "policy alpha", 0.9),
                        new ChunkSearchPort.ChunkHit("doc-2", "Doc 2", "v2", "c-2", "policy beta", 0.8)
                ),
                (query, candidates) -> List.of(
                        new ChunkRerankPort.RerankScore("c-2", 0.95),
                        new ChunkRerankPort.RerankScore("c-1", 0.10)
                ),
                new AclService(),
                new FakeLlmChatPort(),
                new AuditService(new NoopAuditPort()),
                10,
                5,
                3,
                4000
        );

        SearchDtos.SearchOnlyResponse response = service.search(admin(), "policy");

        assertEquals(2, response.hits().size());
        assertEquals("c-2", response.hits().getFirst().chunkId());
        assertEquals(0.95, response.hits().getFirst().score(), 0.0001);
        assertEquals("v2", response.hits().getFirst().documentVersion());
        assertEquals("OK", response.status());
    }

    @Test
    void searchFallsBackToRetrievalScoresWhenRerankerFails() {
        SearchService service = new SearchService(
                (actorId, isAdmin, query, limit) -> List.of(
                        new ChunkSearchPort.ChunkHit("doc-1", "Doc 1", "v1", "c-1", "policy alpha", 0.9),
                        new ChunkSearchPort.ChunkHit("doc-2", "Doc 2", "v2", "c-2", "policy beta", 0.8)
                ),
                (query, candidates) -> {
                    throw new IllegalStateException("reranker unavailable");
                },
                new AclService(),
                new FakeLlmChatPort(),
                new AuditService(new NoopAuditPort()),
                10,
                5,
                3,
                4000
        );

        SearchDtos.SearchOnlyResponse response = service.search(admin(), "policy");

        assertEquals(2, response.hits().size());
        assertEquals("c-1", response.hits().getFirst().chunkId());
        assertEquals(0.9, response.hits().getFirst().score(), 0.0001);
    }

    @Test
    void answerUsesSameRerankedRetrievalOrderForContextAndIncludesVersionedSources() {
        FakeLlmChatPort llm = new FakeLlmChatPort();
        SearchService service = new SearchService(
                (actorId, isAdmin, query, limit) -> List.of(
                        new ChunkSearchPort.ChunkHit("doc-1", "Doc 1", "v1", "c-1", "alpha context", 0.9),
                        new ChunkSearchPort.ChunkHit("doc-2", "Doc 2", "v2", "c-2", "beta context", 0.8)
                ),
                (query, candidates) -> List.of(
                        new ChunkRerankPort.RerankScore("c-2", 0.95),
                        new ChunkRerankPort.RerankScore("c-1", 0.10)
                ),
                new AclService(),
                llm,
                new AuditService(new NoopAuditPort()),
                10,
                5,
                3,
                4000
        );

        SearchDtos.AnswerWithSourcesResponse response = service.answer(admin(), "policy");

        assertEquals(2, response.sources().size());
        assertEquals("c-2", response.sources().getFirst().chunkId());
        assertEquals("doc-2", response.sources().getFirst().documentId());
        assertEquals("Doc 2", response.sources().getFirst().documentTitle());
        assertEquals("v2", response.sources().getFirst().documentVersion());
        assertEquals("beta context", llm.contextChunks().getFirst());
        assertTrue(llm.systemPrompt().contains("корпоративный ассистент"));
        assertTrue(response.answer().contains("ok"));
        assertEquals("OK", response.status());
        assertTrue(response.pipeline().llmLatencyMs() != null);
    }

    @Test
    void answerReturnsNoContextWithoutLlmCallWhenNoHitsFound() {
        FakeLlmChatPort llm = new FakeLlmChatPort();
        SearchService service = new SearchService(
                (actorId, isAdmin, query, limit) -> List.of(),
                (query, candidates) -> List.of(),
                new AclService(),
                llm,
                new AuditService(new NoopAuditPort()),
                10,
                5,
                3,
                4000
        );

        SearchDtos.AnswerWithSourcesResponse response = service.answer(admin(), "missing");

        assertEquals("NO_CONTEXT", response.status());
        assertEquals("Не найдено релевантных документов по запросу.", response.answer());
        assertEquals(0, response.sources().size());
        assertTrue(llm.contextChunks().isEmpty());
        assertEquals(null, response.pipeline().llmLatencyMs());
    }

    private static UserView admin() {
        return new UserView("u-admin", "admin@dmis.local", "Admin", Set.of(RoleName.ADMIN));
    }

    private static final class FakeLlmChatPort implements LlmChatPort {
        private final List<String> contextChunks = new ArrayList<>();
        private String systemPrompt;

        @Override
        public ChatResponse chat(ChatRequest request) {
            contextChunks.clear();
            contextChunks.addAll(request.contextChunks());
            systemPrompt = request.systemPrompt();
            return new ChatResponse("ok", "test", "fake");
        }

        @Override
        public InputStream chatStream(ChatRequest request) {
            throw new UnsupportedOperationException("not needed for unit tests");
        }

        List<String> contextChunks() {
            return contextChunks;
        }

        String systemPrompt() {
            return systemPrompt;
        }
    }

    private static final class NoopAuditPort implements AuditPort {
        @Override
        public void append(AuditView auditView) {
        }

        @Override
        public List<AuditView> findAll() {
            return List.of();
        }
    }
}

