package com.dmis.backend.documents.domain.model;

public record VersionId(String value) {
    public VersionId {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Version id is required");
        }
        if (!value.matches("v\\d+")) {
            throw new IllegalArgumentException("Version id must match v<number>");
        }
    }

    public static VersionId initial() {
        return new VersionId("v1");
    }

    public static VersionId next(int currentVersionsCount) {
        return new VersionId("v" + (currentVersionsCount + 1));
    }
}
