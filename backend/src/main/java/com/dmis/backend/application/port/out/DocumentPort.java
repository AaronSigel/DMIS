package com.dmis.backend.documents.application.port;

import com.dmis.backend.documents.domain.model.Document;
import com.dmis.backend.documents.domain.model.DocumentId;

import java.util.List;
import java.util.Optional;

public interface DocumentPort {
    Document save(Document document);

    Optional<Document> findById(DocumentId id);

    List<Document> findAll();
}
