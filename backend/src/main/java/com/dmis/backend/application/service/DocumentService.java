package com.dmis.backend.documents.application;

import com.dmis.backend.audit.application.AuditService;
import com.dmis.backend.documents.application.DocumentIndexingService;
import com.dmis.backend.documents.application.dto.DocumentDtos;
import com.dmis.backend.documents.application.port.DocumentPort;
import com.dmis.backend.documents.application.port.TextExtractionPort;
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
public class DocumentService {
    private final DocumentPort documentPort;
    private final ObjectStoragePort objectStoragePort;
    private final TextExtractionPort textExtractionPort;
    private final DocumentIndexingService documentIndexingService;
    private final AclService aclService;
    private final AuditService auditService;

    public DocumentService(
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
        String docId = "doc-" + UUID.randomUUID();
        String versionId = "v1";
        String objectPath = docId + "/" + versionId + "/" + fileName;
        String storageRef = objectStoragePort.store(objectPath, content, contentType);
        String extractedText = textExtractionPort.extract(fileName, content, contentType);
        DocumentDtos.DocumentView document = new DocumentDtos.DocumentView(
                docId,
                fileName,
                actor.id(),
                List.of(new DocumentDtos.DocumentVersionView(versionId, fileName, Instant.now())),
                storageRef,
                extractedText
        );
        DocumentDtos.DocumentView saved = documentPort.save(document);
        int chunks = documentIndexingService.index(saved.id(), versionId, extractedText);
        auditService.append(actor.id(), "document.upload", "document", saved.id(), "Uploaded initial version");
        auditService.append(actor.id(), "document.index", "document", saved.id(), "Indexed " + chunks + " chunks for " + versionId);
        return saved;
    }

    public List<DocumentDtos.DocumentView> list(UserView actor) {
        return documentPort.findAll().stream()
                .filter(doc -> aclService.isAdmin(actor) || doc.ownerId().equals(actor.id()))
                .sorted(Comparator.comparing(DocumentDtos.DocumentView::title))
                .toList();
    }

    public DocumentDtos.DocumentView get(UserView actor, String documentId) {
        DocumentDtos.DocumentView doc = documentPort.findById(documentId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Document not found"));
        aclService.requireDocumentRead(actor, doc);
        return doc;
    }

    public DocumentDtos.DocumentView addVersion(UserView actor, String documentId, String fileName, byte[] content, String contentType) {
        DocumentDtos.DocumentView doc = get(actor, documentId);
        aclService.requireDocumentWrite(actor, doc);
        String versionId = "v" + (doc.versions().size() + 1);
        String objectPath = doc.id() + "/" + versionId + "/" + fileName;
        String storageRef = objectStoragePort.store(objectPath, content, contentType);
        DocumentDtos.DocumentVersionView version = new DocumentDtos.DocumentVersionView(versionId, fileName, Instant.now());
        documentPort.addVersion(doc.id(), version);
        String extractedText = textExtractionPort.extract(fileName, content, contentType);
        DocumentDtos.DocumentView updated = documentPort.save(new DocumentDtos.DocumentView(
                doc.id(),
                doc.title(),
                doc.ownerId(),
                listVersions(doc.id()),
                storageRef,
                doc.extractedText() + "\n" + extractedText
        ));
        auditService.append(actor.id(), "document.version.add", "document", doc.id(), "Added " + versionId);
        int chunks = documentIndexingService.index(doc.id(), versionId, extractedText);
        auditService.append(actor.id(), "document.index", "document", doc.id(), "Indexed " + chunks + " chunks for " + versionId);
        return updated;
    }

    private List<DocumentDtos.DocumentVersionView> listVersions(String docId) {
        return documentPort.findById(docId).map(DocumentDtos.DocumentView::versions)
                .orElse(List.of());
    }

}
