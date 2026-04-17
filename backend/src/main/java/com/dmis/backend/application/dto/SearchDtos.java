package com.dmis.backend.search.application.dto;

import java.util.List;

public final class SearchDtos {
    private SearchDtos() {
    }

    public record SearchHitView(String documentId, String title, String chunkId, String chunkText, double score) {
    }

    public record SearchResponse(String query, List<SearchHitView> hits) {
    }

    public record RagSourceView(String documentId, String title, String chunkId, String chunkText) {
    }

    public record RagResponse(String answer, List<RagSourceView> sources) {
    }
}
