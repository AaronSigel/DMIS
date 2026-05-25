package com.dmis.backend.assistant.application;

/**
 * Тип пользовательского запроса к ассистенту (до вызова action parser / LLM).
 */
public enum RequestType {
    DOCUMENT_SUMMARY,
    DOCUMENT_QA,
    DOCUMENT_SEARCH,
    CONTROLLED_ACTION,
    GENERAL_CHAT,
    UNKNOWN
}
