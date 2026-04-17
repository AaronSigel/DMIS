package com.dmis.backend.search.application;

import com.dmis.backend.search.application.port.ChunkSearchPort;
import com.dmis.backend.search.application.port.ChunkRerankPort;
import com.dmis.backend.search.application.port.LlmChatPort;
import com.dmis.backend.search.application.dto.SearchDtos;
import com.dmis.backend.audit.application.AuditService;
import com.dmis.backend.shared.model.UserView;
import com.dmis.backend.shared.security.AclService;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class SearchService {
    private final ChunkSearchPort chunkSearchPort;
    private final ChunkRerankPort chunkRerankPort;
    private final AclService aclService;
    private final LlmChatPort llmChatPort;
    private final AuditService auditService;

    public SearchService(
            ChunkSearchPort chunkSearchPort,
            ChunkRerankPort chunkRerankPort,
            AclService aclService,
            LlmChatPort llmChatPort,
            AuditService auditService
    ) {
        this.chunkSearchPort = chunkSearchPort;
        this.chunkRerankPort = chunkRerankPort;
        this.aclService = aclService;
        this.llmChatPort = llmChatPort;
        this.auditService = auditService;
    }

    public SearchDtos.SearchResponse search(UserView actor, String query) {
        boolean isAdmin = aclService.isAdmin(actor);
        List<ChunkSearchPort.ChunkHit> candidates = chunkSearchPort.search(actor.id(), isAdmin, query, 10);
        if (candidates.isEmpty()) {
            return new SearchDtos.SearchResponse(query, List.of());
        }

        Map<String, Double> rerankScores = loadRerankScores(query, candidates);
        List<SearchDtos.SearchHitView> hits = candidates.stream()
                .map(hit -> new SearchDtos.SearchHitView(
                        hit.documentId(),
                        hit.title(),
                        hit.chunkId(),
                        hit.chunkText(),
                        rerankScores.getOrDefault(hit.chunkId(), hit.score())
                ))
                .sorted(Comparator.comparingDouble(SearchDtos.SearchHitView::score).reversed())
                .toList();
        return new SearchDtos.SearchResponse(query, hits);
    }

    private Map<String, Double> loadRerankScores(String query, List<ChunkSearchPort.ChunkHit> candidates) {
        try {
            return chunkRerankPort.rerank(
                            query,
                            candidates.stream()
                                    .map(hit -> new ChunkRerankPort.Candidate(hit.chunkId(), hit.chunkText()))
                                    .toList()
                    ).stream()
                    .collect(Collectors.toMap(
                            ChunkRerankPort.RerankScore::chunkId,
                            ChunkRerankPort.RerankScore::score,
                            (left, right) -> left
                    ));
        } catch (Exception ignored) {
            return Map.of();
        }
    }

    public SearchDtos.RagResponse answer(UserView actor, String question) {
        SearchDtos.SearchResponse response = search(actor, question);
        if (response.hits().isEmpty()) {
            return new SearchDtos.RagResponse("Не найдено релевантных документов по запросу.", List.of());
        }

        List<SearchDtos.RagSourceView> sources = response.hits().stream()
                .limit(3)
                .map(hit -> new SearchDtos.RagSourceView(hit.documentId(), hit.title(), hit.chunkId(), hit.chunkText()))
                .toList();

        List<String> contextChunks = sources.stream().map(SearchDtos.RagSourceView::chunkText).toList();
        List<String> documentIds = sources.stream().map(SearchDtos.RagSourceView::documentId).distinct().toList();

        long startedAtMs = System.currentTimeMillis();
        String ragId = "rag-" + UUID.randomUUID();
        auditService.append(
                actor.id(),
                "rag.answer.request",
                "rag",
                ragId,
                "question=" + question + ", chunks=" + contextChunks.size() + ", documents=" + documentIds
        );

        LlmChatPort.ChatResponse llm = llmChatPort.chat(new LlmChatPort.ChatRequest(
                question,
                contextChunks,
                null,
                null,
                null,
                null
        ));

        long elapsedMs = System.currentTimeMillis() - startedAtMs;
        auditService.append(
                actor.id(),
                "rag.answer.response",
                "rag",
                ragId,
                "provider=" + llm.provider() + ", model=" + llm.model() + ", elapsedMs=" + elapsedMs
        );

        return new SearchDtos.RagResponse(llm.answer(), sources);
    }
}
