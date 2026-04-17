package com.dmis.backend.documents.application;

import com.dmis.backend.audit.application.AuditService;
import com.dmis.backend.documents.application.dto.DocumentDtos;
import com.dmis.backend.documents.application.port.DocumentPort;
import com.dmis.backend.documents.application.port.TextExtractionPort;
import com.dmis.backend.documents.domain.model.Document;
import com.dmis.backend.documents.domain.model.DocumentId;
import com.dmis.backend.integrations.application.port.ObjectStoragePort;
import com.dmis.backend.shared.model.UserView;
import com.dmis.backend.shared.security.AclService;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class DocumentUseCases {
    private static final String INITIAL_VERSION_ID = "v1";

    private final DocumentPort documentPort;
    private final ObjectStoragePort objectStoragePort;
    private final TextExtractionPort textExtractionPort;
    private final DocumentIndexingService documentIndexingService;
    private final AclService aclService;
    private final AuditService auditService;

    public DocumentUseCases(
            DocumentPort documentPort,
            ObjectStoragePort objectStoragePort,
            TextExtractionPort textExtractionPort,
            DocumentIndexingService documentIndexingService,
            AclService aclService,
            AuditService auditService
    ) {
        this.documentPort = documentPort;
        this.objectStoragePort = objectStoragePort;
        this.textExtractionPort = textExtractionPort;
        this.documentIndexingService = documentIndexingService;
        this.aclService = aclService;
        this.auditService = auditService;
    }

    public DocumentDtos.DocumentView upload(UserView actor, String fileName, byte[] content, String contentType) {
        Instant now = Instant.now();
        DocumentId documentId = DocumentId.from("doc-" + UUID.randomUUID());
        String storageRef = objectStoragePort.store(objectPath(documentId, INITIAL_VERSION_ID, fileName), content, contentType);
        String extractedText = textExtractionPort.extract(fileName, content, contentType);

        Document created = Document.create(
                documentId,
                fileName,
                actor.id(),
                fileName,
                contentType,
                content.length,
                storageRef,
                extractedText,
                now
        );
        Document saved = documentPort.save(created);
        int chunks = documentIndexingService.index(saved.id().value(), INITIAL_VERSION_ID, extractedText);
        auditService.append(actor.id(), "document.upload", "document", saved.id().value(), "Uploaded initial version");
        auditService.append(
                actor.id(),
                "document.index",
                "document",
                saved.id().value(),
                "Indexed " + chunks + " chunks for " + INITIAL_VERSION_ID
        );
        return toView(saved);
    }

    public List<DocumentDtos.DocumentView> list(UserView actor) {
        return documentPort.findAll().stream()
                .filter(doc -> aclService.isAdmin(actor) || doc.ownerId().equals(actor.id()))
                .sorted(Comparator.comparing(Document::title))
                .map(this::toView)
                .toList();
    }

    public DocumentDtos.DocumentView get(UserView actor, String documentId) {
        Document document = documentPort.findById(DocumentId.from(documentId))
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Document not found"));
        aclService.requireDocumentRead(actor, document.ownerId());
        return toView(document);
    }

    public DocumentDtos.DocumentView addVersion(UserView actor, String documentId, String fileName, byte[] content, String contentType) {
        Document current = documentPort.findById(DocumentId.from(documentId))
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Document not found"));
        aclService.requireDocumentWrite(actor, current.ownerId());

        String versionId = "v" + (current.versions().size() + 1);
        String storageRef = objectStoragePort.store(objectPath(current.id(), versionId, fileName), content, contentType);
        String extractedText = textExtractionPort.extract(fileName, content, contentType);
        Document updated = current.addVersion(
                fileName,
                contentType,
                content.length,
                storageRef,
                extractedText,
                Instant.now()
        );
        Document saved = documentPort.save(updated);

        auditService.append(actor.id(), "document.version.add", "document", saved.id().value(), "Added " + versionId);
        int chunks = documentIndexingService.index(saved.id().value(), versionId, extractedText);
        auditService.append(
                actor.id(),
                "document.index",
                "document",
                saved.id().value(),
                "Indexed " + chunks + " chunks for " + versionId
        );
        return toView(saved);
    }

    private String objectPath(DocumentId documentId, String versionId, String fileName) {
        return documentId.value() + "/" + versionId + "/" + fileName;
    }

    private DocumentDtos.DocumentView toView(Document document) {
        return new DocumentDtos.DocumentView(
                document.id().value(),
                document.title(),
                document.ownerId(),
                document.versions().stream().map(version -> new DocumentDtos.DocumentVersionView(
                        version.versionId().value(),
                        version.fileName(),
                        version.contentType(),
                        version.sizeBytes(),
                        version.storageRef(),
                        version.createdAt()
                )).toList(),
                document.latestVersion().storageRef(),
                document.fullExtractedText()
        );
    }
}
