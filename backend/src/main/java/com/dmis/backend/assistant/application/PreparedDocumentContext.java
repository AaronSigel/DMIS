package com.dmis.backend.assistant.application;

import com.dmis.backend.search.application.dto.SearchDtos;

import java.util.List;

public record PreparedDocumentContext(
        String status,
        String diagnosticCode,
        String userMessage,
        List<String> documentIds,
        List<DocumentContextItem> documents,
        List<String> contextChunks,
        List<SearchDtos.RagSourceView> sources,
        boolean llmAllowed
) {
}
