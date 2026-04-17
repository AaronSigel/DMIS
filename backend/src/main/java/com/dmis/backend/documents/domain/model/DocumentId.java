package com.dmis.backend.documents.domain.model;

import java.util.Objects;

public record DocumentId(String value) {
    public DocumentId {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Document id is required");
        }
    }

    public static DocumentId from(String value) {
        return new DocumentId(value);
    }

    @Override
    public String toString() {
        return Objects.requireNonNull(value);
    }
}
