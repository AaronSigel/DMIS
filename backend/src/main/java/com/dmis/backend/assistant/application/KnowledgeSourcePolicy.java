package com.dmis.backend.assistant.application;

import java.util.List;
import java.util.Locale;

/**
 * MVP-политика источников знаний для RAG: поддержан только {@code documents}.
 */
public final class KnowledgeSourcePolicy {
    public static final String SOURCE_DOCUMENTS = "documents";
    public static final String STATUS_KNOWLEDGE_SOURCE_UNSUPPORTED = "KNOWLEDGE_SOURCE_UNSUPPORTED";

    private KnowledgeSourcePolicy() {
    }

    public static List<String> normalize(List<String> knowledgeSourceIds) {
        if (knowledgeSourceIds == null || knowledgeSourceIds.isEmpty()) {
            return List.of(SOURCE_DOCUMENTS);
        }
        return knowledgeSourceIds.stream()
                .filter(id -> id != null && !id.isBlank())
                .map(id -> id.trim().toLowerCase(Locale.ROOT))
                .distinct()
                .toList();
    }

    public static boolean documentsEnabled(List<String> knowledgeSourceIds) {
        return normalize(knowledgeSourceIds).contains(SOURCE_DOCUMENTS);
    }

    public static boolean unsupportedOnly(List<String> knowledgeSourceIds) {
        List<String> normalized = normalize(knowledgeSourceIds);
        return !normalized.isEmpty() && !normalized.contains(SOURCE_DOCUMENTS);
    }

    public static String unsupportedMessage() {
        return "Поиск по выбранным источникам знаний пока не поддерживается. Доступен только источник «documents».";
    }
}
