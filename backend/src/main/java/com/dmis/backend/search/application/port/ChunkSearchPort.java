package com.dmis.backend.search.application.port;

import java.util.List;

public interface ChunkSearchPort {
    List<ChunkHit> search(String actorId, boolean isAdmin, String query, int limit);

    record ChunkHit(
            String documentId,
            String title,
            String documentVersion,
            String chunkId,
            String chunkText,
            double score
    ) {
    }
}

