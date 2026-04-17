package com.dmis.backend.documents.application.port;

import com.dmis.backend.documents.application.dto.DocumentDtos;

import java.util.List;
import java.util.Optional;

public interface DocumentPort {
    DocumentDtos.DocumentView save(DocumentDtos.DocumentView document);

    Optional<DocumentDtos.DocumentView> findById(String id);

    List<DocumentDtos.DocumentView> findAll();

    DocumentDtos.DocumentVersionView addVersion(String documentId, DocumentDtos.DocumentVersionView version);
}
