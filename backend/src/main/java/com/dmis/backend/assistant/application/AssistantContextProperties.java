package com.dmis.backend.assistant.application;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "assistant.context")
public record AssistantContextProperties(
        int maxDocumentSummaryChars,
        int maxDocuments,
        boolean summaryDirectTextEnabled
) {
    public AssistantContextProperties {
        if (maxDocumentSummaryChars <= 0) {
            maxDocumentSummaryChars = 12_000;
        }
        if (maxDocuments <= 0) {
            maxDocuments = 5;
        }
    }
}
