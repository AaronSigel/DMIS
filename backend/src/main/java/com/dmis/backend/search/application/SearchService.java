package com.dmis.backend.search.application;

import com.dmis.backend.search.application.port.ChunkSearchPort;
import com.dmis.backend.search.application.port.ChunkRerankPort;
import com.dmis.backend.search.application.port.LlmChatPort;
import com.dmis.backend.search.application.dto.SearchDtos;
import com.dmis.backend.audit.application.AuditService;
import com.dmis.backend.shared.model.UserView;
import com.dmis.backend.shared.security.AclService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class SearchService {
    private static final String STATUS_OK = "OK";
    private static final String STATUS_NO_RESULTS = "NO_RESULTS";
    private static final String STATUS_NO_CONTEXT = "NO_CONTEXT";
    private static final String NO_CONTEXT_ANSWER = "Не найдено релевантных документов по запросу.";
    private static final String RAG_SYSTEM_PROMPT = """
            Ты корпоративный ассистент системы документооборота.
            Отвечай только на основании предоставленного контекста.
            Если в контексте недостаточно данных, скажи это явно и не выдумывай факты.
            Формулируй ответ в деловом стиле и, когда возможно, ссылайся на источники по их порядку: [1], [2], [3].
            """;
    private static final String RAG_STRICT_PROFILE_PROMPT = """
            Ты корпоративный ассистент системы документооборота.
            Отвечай только фактами из контекста, без интерпретаций и предположений.
            Если фактов недостаточно, ответь: "Недостаточно данных в источниках."
            """;
    private static final String RAG_CREATIVE_PROFILE_PROMPT = """
            Ты корпоративный ассистент системы документооборота.
            Отвечай на основе контекста, но допускай краткие рекомендации по следующим шагам.
            Если данных недостаточно, явно отмечай ограничения.
            """;

    private final ChunkSearchPort chunkSearchPort;
    private final ChunkRerankPort chunkRerankPort;
    private final AclService aclService;
    private final LlmChatPort llmChatPort;
    private final AuditService auditService;
    private final int retrievalTopK;
    private final int rerankTopN;
    private final int maxContextChunks;
    private final int maxContextChars;
    private final int ragMaxTokens;

    public SearchService(
            ChunkSearchPort chunkSearchPort,
            ChunkRerankPort chunkRerankPort,
            AclService aclService,
            LlmChatPort llmChatPort,
            AuditService auditService,
            @Value("${search.retrieval.top-k:10}") int retrievalTopK,
            @Value("${search.rerank.top-n:5}") int rerankTopN,
            @Value("${search.rag.max-context-chunks:3}") int maxContextChunks,
            @Value("${search.rag.max-context-chars:4000}") int maxContextChars,
            @Value("${search.rag.max-tokens:0}") int ragMaxTokens
    ) {
        this.chunkSearchPort = chunkSearchPort;
        this.chunkRerankPort = chunkRerankPort;
        this.aclService = aclService;
        this.llmChatPort = llmChatPort;
        this.auditService = auditService;
        this.retrievalTopK = retrievalTopK;
        this.rerankTopN = rerankTopN;
        this.maxContextChunks = maxContextChunks;
        this.maxContextChars = maxContextChars;
        this.ragMaxTokens = ragMaxTokens;
    }

    public SearchDtos.SearchOnlyResponse search(UserView actor, String query) {
        return search(actor, query, List.of());
    }

    public SearchDtos.SearchOnlyResponse search(UserView actor, String query, List<String> documentIds) {
        boolean isAdmin = aclService.isAdmin(actor);
        String searchId = "search-" + UUID.randomUUID();
        long totalStartedAtMs = System.currentTimeMillis();
        auditService.append(actor.id(), "search.request", "search", searchId, "query=" + query);

        long retrievalStartedAtMs = System.currentTimeMillis();
        List<ChunkSearchPort.ChunkHit> candidates = chunkSearchPort.search(actor.id(), isAdmin, query, retrievalTopK, documentIds);
        long retrievalLatencyMs = System.currentTimeMillis() - retrievalStartedAtMs;
        auditService.append(
                actor.id(),
                "search.retrieval",
                "search",
                searchId,
                "latencyMs=" + retrievalLatencyMs + ", retrievedCount=" + candidates.size() + ", topK=" + retrievalTopK
        );

        if (candidates.isEmpty()) {
            long totalLatencyMs = System.currentTimeMillis() - totalStartedAtMs;
            SearchDtos.SearchPipelineMeta pipeline = new SearchDtos.SearchPipelineMeta(
                    retrievalTopK,
                    rerankTopN,
                    0,
                    0,
                    retrievalLatencyMs,
                    0L,
                    totalLatencyMs
            );
            auditService.append(
                    actor.id(),
                    "search.response",
                    "search",
                    searchId,
                    "status=" + STATUS_NO_RESULTS + ", totalLatencyMs=" + totalLatencyMs
            );
            return new SearchDtos.SearchOnlyResponse(query, STATUS_NO_RESULTS, List.of(), pipeline);
        }

        long rerankStartedAtMs = System.currentTimeMillis();
        RerankResult rerank = loadRerankScores(query, candidates);
        long rerankLatencyMs = System.currentTimeMillis() - rerankStartedAtMs;
        auditService.append(
                actor.id(),
                "search.rerank",
                "search",
                searchId,
                "latencyMs=" + rerankLatencyMs + ", rerankFailed=" + rerank.failed() + ", topN=" + rerankTopN
        );

        List<SearchDtos.SearchHitView> hits = candidates.stream()
                .map(hit -> new SearchDtos.SearchHitView(
                        hit.documentId(),
                        hit.title(),
                        hit.chunkId(),
                        hit.chunkText(),
                        rerank.scores().getOrDefault(hit.chunkId(), hit.score())
                ))
                .sorted(Comparator.comparingDouble(SearchDtos.SearchHitView::score).reversed())
                .limit(rerankTopN)
                .toList();

        long totalLatencyMs = System.currentTimeMillis() - totalStartedAtMs;
        SearchDtos.SearchPipelineMeta pipeline = new SearchDtos.SearchPipelineMeta(
                retrievalTopK,
                rerankTopN,
                candidates.size(),
                hits.size(),
                retrievalLatencyMs,
                rerankLatencyMs,
                totalLatencyMs
        );
        auditService.append(
                actor.id(),
                "search.response",
                "search",
                searchId,
                "status=" + STATUS_OK + ", returnedCount=" + hits.size() + ", totalLatencyMs=" + totalLatencyMs
        );
        return new SearchDtos.SearchOnlyResponse(query, STATUS_OK, hits, pipeline);
    }

    private RerankResult loadRerankScores(String query, List<ChunkSearchPort.ChunkHit> candidates) {
        try {
            Map<String, Double> scores = chunkRerankPort.rerank(
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
            return new RerankResult(scores, false);
        } catch (Exception ignored) {
            return new RerankResult(Map.of(), true);
        }
    }

    public PreparedAnswer prepareAnswer(UserView actor, String question, String ragEventName) {
        return prepareAnswer(actor, question, ragEventName, new AnswerOptions(List.of(), List.of("documents"), "balanced"));
    }

    public PreparedAnswer prepareAnswer(UserView actor, String question, String ragEventName, AnswerOptions options) {
        SearchDtos.SearchOnlyResponse searchResponse = search(actor, question, options.documentIds());
        ContextSelection contextSelection = selectContext(searchResponse.hits());
        String status = contextSelection.contextChunks().isEmpty() ? STATUS_NO_CONTEXT : STATUS_OK;
        String fallbackAnswer = STATUS_NO_CONTEXT.equals(status) ? NO_CONTEXT_ANSWER : null;
        SearchDtos.AnswerPipelineMeta pipeline = new SearchDtos.AnswerPipelineMeta(
                searchResponse.pipeline().retrievalTopK(),
                searchResponse.pipeline().rerankTopN(),
                maxContextChunks,
                maxContextChars,
                searchResponse.pipeline().retrievedCount(),
                searchResponse.pipeline().returnedCount(),
                contextSelection.sources().size(),
                contextSelection.usedContextChars(),
                contextSelection.contextTrimmed(),
                searchResponse.pipeline().retrievalLatencyMs(),
                searchResponse.pipeline().rerankLatencyMs(),
                null,
                searchResponse.pipeline().totalLatencyMs()
        );
        String ragId = "rag-" + UUID.randomUUID();
        auditService.append(
                actor.id(),
                ragEventName + ".request",
                "rag",
                ragId,
                "question=" + question + ", chunks=" + contextSelection.contextChunks().size()
        );
        auditService.append(
                actor.id(),
                ragEventName + ".retrieval",
                "rag",
                ragId,
                "latencyMs=" + searchResponse.pipeline().retrievalLatencyMs() + ", retrievedCount=" + searchResponse.pipeline().retrievedCount()
        );
        auditService.append(
                actor.id(),
                ragEventName + ".rerank",
                "rag",
                ragId,
                "latencyMs=" + searchResponse.pipeline().rerankLatencyMs() + ", returnedCount=" + searchResponse.pipeline().returnedCount()
        );
        return new PreparedAnswer(question, status, fallbackAnswer, contextSelection.sources(), contextSelection.contextChunks(), pipeline, resolveSystemPrompt(options.ideologyProfileId()), ragId);
    }

    public SearchDtos.AnswerWithSourcesResponse answer(UserView actor, String question) {
        return answer(actor, question, new AnswerOptions(List.of(), List.of("documents"), "balanced"));
    }

    public SearchDtos.AnswerWithSourcesResponse answer(UserView actor, String question, AnswerOptions options) {
        PreparedAnswer prepared = prepareAnswer(actor, question, "rag.answer", options);
        if (STATUS_NO_CONTEXT.equals(prepared.status())) {
            auditService.append(
                    actor.id(),
                    "rag.answer.response",
                    "rag",
                    prepared.ragId(),
                    "status=" + prepared.status() + ", llmLatencyMs=0, totalLatencyMs=" + prepared.pipeline().totalLatencyMs()
            );
            return new SearchDtos.AnswerWithSourcesResponse(
                    question,
                    prepared.status(),
                    prepared.fallbackAnswer(),
                    prepared.sources(),
                    prepared.pipeline()
            );
        }

        long llmStartedAtMs = System.currentTimeMillis();
        LlmChatPort.ChatResponse llm = llmChatPort.chat(new LlmChatPort.ChatRequest(
                question,
                prepared.contextChunks(),
                prepared.systemPrompt(),
                null,
                resolveMaxTokens(),
                null
        ));
        long llmLatencyMs = System.currentTimeMillis() - llmStartedAtMs;
        SearchDtos.AnswerPipelineMeta pipeline = withLlmLatency(prepared.pipeline(), llmLatencyMs);

        auditService.append(
                actor.id(),
                "rag.answer.llm",
                "rag",
                prepared.ragId(),
                "provider=" + llm.provider() + ", model=" + llm.model() + ", latencyMs=" + llmLatencyMs
        );
        auditService.append(
                actor.id(),
                "rag.answer.response",
                "rag",
                prepared.ragId(),
                "status=" + STATUS_OK + ", provider=" + llm.provider() + ", model=" + llm.model()
                        + ", totalLatencyMs=" + pipeline.totalLatencyMs()
        );

        return new SearchDtos.AnswerWithSourcesResponse(question, STATUS_OK, llm.answer(), prepared.sources(), pipeline);
    }

    private SearchDtos.AnswerPipelineMeta withLlmLatency(SearchDtos.AnswerPipelineMeta base, long llmLatencyMs) {
        return new SearchDtos.AnswerPipelineMeta(
                base.retrievalTopK(),
                base.rerankTopN(),
                base.maxContextChunks(),
                base.maxContextChars(),
                base.retrievedCount(),
                base.returnedCount(),
                base.usedContextChunks(),
                base.usedContextChars(),
                base.contextTrimmed(),
                base.retrievalLatencyMs(),
                base.rerankLatencyMs(),
                llmLatencyMs,
                base.totalLatencyMs() + llmLatencyMs
        );
    }

    private String resolveSystemPrompt(String ideologyProfileId) {
        if (ideologyProfileId == null) {
            return RAG_SYSTEM_PROMPT;
        }
        return switch (ideologyProfileId.trim().toLowerCase()) {
            case "strict" -> RAG_STRICT_PROFILE_PROMPT;
            case "creative" -> RAG_CREATIVE_PROFILE_PROMPT;
            default -> RAG_SYSTEM_PROMPT;
        };
    }

    private ContextSelection selectContext(List<SearchDtos.SearchHitView> hits) {
        List<SearchDtos.RagSourceView> sources = new ArrayList<>();
        List<String> contextChunks = new ArrayList<>();
        int usedChars = 0;
        boolean trimmed = false;

        for (SearchDtos.SearchHitView hit : hits) {
            if (sources.size() >= maxContextChunks) {
                trimmed = true;
                break;
            }

            String chunkText = hit.chunkText() == null ? "" : hit.chunkText().trim();
            if (chunkText.isEmpty()) {
                continue;
            }

            int remainingChars = maxContextChars - usedChars;
            if (remainingChars <= 0) {
                trimmed = true;
                break;
            }

            if (chunkText.length() > remainingChars) {
                chunkText = chunkText.substring(0, remainingChars);
                trimmed = true;
            }

            sources.add(new SearchDtos.RagSourceView(
                    hit.documentId(),
                    hit.documentTitle(),
                    hit.chunkId(),
                    chunkText,
                    hit.score()
            ));
            contextChunks.add(chunkText);
            usedChars += chunkText.length();
        }

        if (!trimmed && (hits.size() > sources.size() || sources.size() >= maxContextChunks)) {
            trimmed = hits.size() > sources.size();
        }
        return new ContextSelection(sources, contextChunks, usedChars, trimmed);
    }

    public record PreparedAnswer(
            String query,
            String status,
            String fallbackAnswer,
            List<SearchDtos.RagSourceView> sources,
            List<String> contextChunks,
            SearchDtos.AnswerPipelineMeta pipeline,
            String systemPrompt,
            String ragId
    ) {
    }

    public record AnswerOptions(
            List<String> documentIds,
            List<String> knowledgeSourceIds,
            String ideologyProfileId
    ) {
    }

    private record RerankResult(Map<String, Double> scores, boolean failed) {
    }

    private record ContextSelection(
            List<SearchDtos.RagSourceView> sources,
            List<String> contextChunks,
            int usedContextChars,
            boolean contextTrimmed
    ) {
    }

    /**
     * `<= 0` означает отсутствие явного лимита для провайдера LLM.
     */
    public Integer resolveMaxTokens() {
        return ragMaxTokens > 0 ? ragMaxTokens : null;
    }
}
