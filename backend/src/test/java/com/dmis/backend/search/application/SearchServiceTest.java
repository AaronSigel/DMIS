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
                        new ChunkSearchPort.ChunkHit("doc-1", "Doc 1", "c-1", "policy alpha", 0.9),
                        new ChunkSearchPort.ChunkHit("doc-2", "Doc 2", "c-2", "policy beta", 0.8)
                ),
                (query, candidates) -> List.of(
                        new ChunkRerankPort.RerankScore("c-2", 0.95),
                        new ChunkRerankPort.RerankScore("c-1", 0.10)
                ),
                new AclService(),
                new FakeLlmChatPort(),
                new AuditService(new NoopAuditPort())
        );

        SearchDtos.SearchResponse response = service.search(admin(), "policy");

        assertEquals(2, response.hits().size());
        assertEquals("c-2", response.hits().getFirst().chunkId());
        assertEquals(0.95, response.hits().getFirst().score(), 0.0001);
    }

    @Test
    void searchFallsBackToRetrievalScoresWhenRerankerFails() {
        SearchService service = new SearchService(
                (actorId, isAdmin, query, limit) -> List.of(
                        new ChunkSearchPort.ChunkHit("doc-1", "Doc 1", "c-1", "policy alpha", 0.9),
                        new ChunkSearchPort.ChunkHit("doc-2", "Doc 2", "c-2", "policy beta", 0.8)
                ),
                (query, candidates) -> {
                    throw new IllegalStateException("reranker unavailable");
                },
                new AclService(),
                new FakeLlmChatPort(),
                new AuditService(new NoopAuditPort())
        );

        SearchDtos.SearchResponse response = service.search(admin(), "policy");

        assertEquals(2, response.hits().size());
        assertEquals("c-1", response.hits().getFirst().chunkId());
        assertEquals(0.9, response.hits().getFirst().score(), 0.0001);
    }

    @Test
    void answerUsesSameRerankedRetrievalOrderForContext() {
        FakeLlmChatPort llm = new FakeLlmChatPort();
        SearchService service = new SearchService(
                (actorId, isAdmin, query, limit) -> List.of(
                        new ChunkSearchPort.ChunkHit("doc-1", "Doc 1", "c-1", "alpha context", 0.9),
                        new ChunkSearchPort.ChunkHit("doc-2", "Doc 2", "c-2", "beta context", 0.8)
                ),
                (query, candidates) -> List.of(
                        new ChunkRerankPort.RerankScore("c-2", 0.95),
                        new ChunkRerankPort.RerankScore("c-1", 0.10)
                ),
                new AclService(),
                llm,
                new AuditService(new NoopAuditPort())
        );

        SearchDtos.RagResponse response = service.answer(admin(), "policy");

        assertEquals(2, response.sources().size());
        assertEquals("c-2", response.sources().getFirst().chunkId());
        assertEquals("doc-2", response.sources().getFirst().documentId());
        assertEquals("Doc 2", response.sources().getFirst().title());
        assertEquals("beta context", llm.contextChunks().getFirst());
        assertTrue(response.answer().contains("ok"));
    }

    private static UserView admin() {
        return new UserView("u-admin", "admin@dmis.local", "Admin", Set.of(RoleName.ADMIN));
    }

    private static final class FakeLlmChatPort implements LlmChatPort {
        private final List<String> contextChunks = new ArrayList<>();

        @Override
        public ChatResponse chat(ChatRequest request) {
            contextChunks.clear();
            contextChunks.addAll(request.contextChunks());
            return new ChatResponse("ok", "test", "fake");
        }

        @Override
        public InputStream chatStream(ChatRequest request) {
            throw new UnsupportedOperationException("not needed for unit tests");
        }

        List<String> contextChunks() {
            return contextChunks;
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

