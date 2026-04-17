package com.dmis.backend.search.application.port;

import java.util.List;

public interface ChunkRerankPort {
    List<RerankScore> rerank(String query, List<Candidate> candidates);

    record Candidate(String chunkId, String chunkText) {
    }

    record RerankScore(String chunkId, double score) {
    }
}

