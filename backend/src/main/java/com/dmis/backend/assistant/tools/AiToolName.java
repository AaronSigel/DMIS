package com.dmis.backend.assistant.tools;

public enum AiToolName {
    DOCUMENTS_GET_STATUS("documents.get_status"),
    DOCUMENTS_GET_CONTEXT("documents.get_context"),
    DOCUMENTS_SEARCH("documents.search"),
    USERS_RESOLVE("users.resolve"),
    ACTIONS_PREPARE_DRAFT("actions.prepare_draft");

    private final String toolName;

    AiToolName(String toolName) {
        this.toolName = toolName;
    }

    public String toolName() {
        return toolName;
    }

    public static AiToolName from(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        for (AiToolName tool : values()) {
            if (tool.toolName().equals(value.trim())) {
                return tool;
            }
        }
        return null;
    }
}
