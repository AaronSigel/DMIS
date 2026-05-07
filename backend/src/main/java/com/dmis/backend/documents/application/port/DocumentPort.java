package com.dmis.backend.documents.application.port;

import com.dmis.backend.documents.domain.model.Document;
import com.dmis.backend.documents.domain.model.DocumentId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface DocumentPort {
    Document save(Document document);

    Optional<Document> findById(DocumentId id);

    List<Document> findAll();

    Page<Document> findPage(ListQuery query, Pageable pageable);

    void deleteById(DocumentId id);

    record ListQuery(
            boolean admin,
            String actorId,
            String ownerId,
            String status,
            String type,
            Instant dateFrom,
            Instant dateTo,
            String tag
    ) {
    }
}
