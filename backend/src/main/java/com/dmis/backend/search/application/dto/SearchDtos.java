package com.dmis.backend.search.application.dto;

import java.util.List;

public final class SearchDtos {
    private SearchDtos() {
    }

    public record SearchHitView(
            String documentId,
            String documentTitle,
            String documentVersion,
            String chunkId,
            String chunkText,
            double score
    ) {
    }

    public record SearchOnlyResponse(
            String query,
            String status,
            List<SearchHitView> hits,
            SearchPipelineMeta pipeline
    ) {
    }

    public record RagSourceView(
            String documentId,
            String documentTitle,
            String documentVersion,
            String chunkId,
            String chunkText,
            double score
    ) {
    }

    public record AnswerWithSourcesResponse(
            String query,
            String status,
            String answer,
            List<RagSourceView> sources,
            AnswerPipelineMeta pipeline
    ) {
    }

    public record SearchPipelineMeta(
            int retrievalTopK,
            int rerankTopN,
            int retrievedCount,
            int returnedCount,
            long retrievalLatencyMs,
            long rerankLatencyMs,
            long totalLatencyMs
    ) {
    }

    public record AnswerPipelineMeta(
            int retrievalTopK,
            int rerankTopN,
            int maxContextChunks,
            int maxContextChars,
            int retrievedCount,
            int returnedCount,
            int usedContextChunks,
            int usedContextChars,
            boolean contextTrimmed,
            long retrievalLatencyMs,
            long rerankLatencyMs,
            Long llmLatencyMs,
            long totalLatencyMs
    ) {
    }
}
