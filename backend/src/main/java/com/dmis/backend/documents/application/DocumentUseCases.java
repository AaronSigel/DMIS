package com.dmis.backend.documents.application;

import com.dmis.backend.audit.application.AuditService;
import com.dmis.backend.documents.application.dto.DocumentDtos;
import com.dmis.backend.documents.application.port.DocumentPort;
import com.dmis.backend.documents.application.port.TextExtractionPort;
import com.dmis.backend.documents.domain.model.Document;
import com.dmis.backend.documents.domain.model.DocumentId;
import com.dmis.backend.documents.domain.model.DocumentVersion;
import com.dmis.backend.documents.domain.model.IndexStatus;
import com.dmis.backend.documents.domain.model.VersionId;
import com.dmis.backend.integrations.application.port.ObjectStoragePort;
import com.dmis.backend.platform.error.ApiException;
import com.dmis.backend.shared.model.UserView;
import com.dmis.backend.shared.security.AclService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

import static org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR;
import static org.springframework.http.HttpStatus.NOT_FOUND;
import static org.springframework.http.HttpStatus.UNPROCESSABLE_ENTITY;

@Service
public class DocumentUseCases {
    private static final String INITIAL_VERSION_ID = "v1";
    private static final int DEFAULT_PAGE_SIZE = 20;
    private static final int MAX_PAGE_SIZE = 100;

    private final DocumentPort documentPort;
    private final ObjectStoragePort objectStoragePort;
    private final TextExtractionPort textExtractionPort;
    private final DocumentIndexingService documentIndexingService;
    private final AclService aclService;
    private final AuditService auditService;
    private final int extractedTextPreviewMaxChars;

    public DocumentUseCases(
            DocumentPort documentPort,
            ObjectStoragePort objectStoragePort,
            TextExtractionPort textExtractionPort,
            DocumentIndexingService documentIndexingService,
            AclService aclService,
            AuditService auditService,
            @Value("${documents.extracted-text.preview-max-chars:2000}") int extractedTextPreviewMaxChars
    ) {
        this.documentPort = documentPort;
        this.objectStoragePort = objectStoragePort;
        this.textExtractionPort = textExtractionPort;
        this.documentIndexingService = documentIndexingService;
        this.aclService = aclService;
        this.auditService = auditService;
        this.extractedTextPreviewMaxChars = Math.max(1, extractedTextPreviewMaxChars);
    }

    public DocumentDtos.DocumentView upload(UserView actor, String fileName, byte[] content, String contentType) {
        Instant now = Instant.now();
        DocumentId documentId = DocumentId.from("doc-" + UUID.randomUUID());
        String storageRef = storeFile(objectPath(documentId, INITIAL_VERSION_ID, fileName), content, contentType);
        String extractedText = extractText(fileName, content, contentType);

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
        saved = indexVersion(saved, VersionId.initial(), extractedText);
        int chunks = version(saved, VersionId.initial()).indexedChunkCount();
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

    public DocumentDtos.PageResponse<DocumentDtos.DocumentView> list(UserView actor, DocumentDtos.DocumentListQuery query) {
        Comparator<Document> comparator = sortComparator(query.sortBy(), query.order());
        List<Document> filtered = documentPort.findAll().stream()
                .filter(doc -> aclService.isAdmin(actor) || doc.ownerId().equals(actor.id()))
                .filter(doc -> matchesOwnerFilter(actor, doc, query.ownerId()))
                .filter(doc -> matchesStatus(doc, query.status()))
                .filter(doc -> matchesType(doc, query.type()))
                .filter(doc -> matchesDateRange(doc, query.dateFrom(), query.dateTo()))
                .filter(doc -> matchesTag(doc, query.tag()))
                .sorted(comparator)
                .toList();

        int page = Math.max(0, query.page());
        int size = query.size() > 0 ? query.size() : DEFAULT_PAGE_SIZE;
        size = Math.min(size, MAX_PAGE_SIZE);
        long total = filtered.size();
        int totalPages = total == 0 ? 0 : (int) Math.ceil(total / (double) size);
        int from = page * size;
        List<Document> slice = from >= filtered.size()
                ? List.of()
                : filtered.subList(from, Math.min(from + size, filtered.size()));

        return new DocumentDtos.PageResponse<>(
                slice.stream().map(this::toView).toList(),
                total,
                totalPages,
                page,
                size
        );
    }

    public DocumentDtos.DocumentView get(UserView actor, String documentId) {
        Document document = documentPort.findById(DocumentId.from(documentId))
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Document not found"));
        aclService.requireDocumentRead(actor, document.ownerId());
        return toView(document);
    }

    public DocumentDtos.DocumentView patch(UserView actor, String documentId, DocumentDtos.PatchDocumentRequest request) {
        Document document = documentPort.findById(DocumentId.from(documentId))
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Document not found"));
        aclService.requireDocumentWrite(actor, document.ownerId());
        if (request.tags() == null) {
            throw new ApiException(UNPROCESSABLE_ENTITY, "TAGS_REQUIRED", "tags field is required", Map.of());
        }
        Document updated = document.withTags(request.tags(), Instant.now());
        Document saved = documentPort.save(updated);
        auditService.append(actor.id(), "document.patch", "document", saved.id().value(), "Updated tags");
        return toView(saved);
    }

    public String getLatestExtractedText(UserView actor, String documentId) {
        Document document = documentPort.findById(DocumentId.from(documentId))
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Document not found"));
        aclService.requireDocumentRead(actor, document.ownerId());
        return document.fullExtractedText();
    }

    public String getVersionExtractedText(UserView actor, String documentId, String versionId) {
        Document document = documentPort.findById(DocumentId.from(documentId))
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Document not found"));
        aclService.requireDocumentRead(actor, document.ownerId());
        return version(document, new VersionId(versionId)).extractedText();
    }

    public DocumentDtos.DocumentBinary downloadVersion(UserView actor, String documentId, String versionId) {
        Document document = documentPort.findById(DocumentId.from(documentId))
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Document not found"));
        aclService.requireDocumentRead(actor, document.ownerId());
        DocumentVersion target = version(document, new VersionId(versionId));
        byte[] bytes = loadFile(target.storageRef(), documentId, versionId);
        auditService.append(actor.id(), "document.download", "document", document.id().value(), "Downloaded " + versionId);
        return new DocumentDtos.DocumentBinary(target.fileName(), target.contentType(), bytes);
    }

    public DocumentDtos.DocumentBinary downloadLatest(UserView actor, String documentId) {
        Document document = documentPort.findById(DocumentId.from(documentId))
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Document not found"));
        aclService.requireDocumentRead(actor, document.ownerId());
        DocumentVersion latest = document.latestVersion();
        byte[] bytes = loadFile(latest.storageRef(), documentId, latest.versionId().value());
        auditService.append(actor.id(), "document.download", "document", document.id().value(), "Downloaded latest");
        return new DocumentDtos.DocumentBinary(latest.fileName(), latest.contentType(), bytes);
    }

    public DocumentDtos.DocumentView addVersion(UserView actor, String documentId, String fileName, byte[] content, String contentType) {
        Document current = documentPort.findById(DocumentId.from(documentId))
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Document not found"));
        aclService.requireDocumentWrite(actor, current.ownerId());

        String newVersionId = "v" + (current.versions().size() + 1);
        String storageRef = storeFile(objectPath(current.id(), newVersionId, fileName), content, contentType);
        String extractedText = extractText(fileName, content, contentType);
        Document updated = current.addVersion(
                fileName,
                contentType,
                content.length,
                storageRef,
                extractedText,
                Instant.now()
        );
        Document saved = documentPort.save(updated);

        auditService.append(actor.id(), "document.version.add", "document", saved.id().value(), "Added " + newVersionId);
        VersionId targetVersionId = new VersionId(newVersionId);
        saved = indexVersion(saved, targetVersionId, extractedText);
        int chunks = version(saved, targetVersionId).indexedChunkCount();
        auditService.append(
                actor.id(),
                "document.index",
                "document",
                saved.id().value(),
                "Indexed " + chunks + " chunks for " + newVersionId
        );
        return toView(saved);
    }

    public void delete(UserView actor, String documentId) {
        Document document = documentPort.findById(DocumentId.from(documentId))
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Document not found"));
        aclService.requireDocumentWrite(actor, document.ownerId());
        for (DocumentVersion v : document.versions()) {
            deleteFile(v.storageRef(), document.id().value(), v.versionId().value());
        }
        documentPort.deleteById(document.id());
        auditService.append(actor.id(), "document.delete", "document", document.id().value(), "Deleted document");
    }

    private String objectPath(DocumentId documentId, String versionId, String fileName) {
        return documentId.value() + "/" + versionId + "/" + fileName;
    }

    private String storeFile(String objectPath, byte[] content, String contentType) {
        try {
            return objectStoragePort.store(objectPath, content, contentType);
        } catch (RuntimeException exception) {
            throw new ApiException(
                    INTERNAL_SERVER_ERROR,
                    "STORAGE_FAILED",
                    "Failed to store file",
                    Map.of("objectPath", objectPath)
            );
        }
    }

    private byte[] loadFile(String storageRef, String documentId, String versionId) {
        try {
            return objectStoragePort.load(storageRef);
        } catch (RuntimeException exception) {
            throw new ApiException(
                    INTERNAL_SERVER_ERROR,
                    "STORAGE_FAILED",
                    "Failed to download file",
                    Map.of("documentId", documentId, "versionId", versionId)
            );
        }
    }

    private void deleteFile(String storageRef, String documentId, String versionId) {
        try {
            objectStoragePort.delete(storageRef);
        } catch (RuntimeException exception) {
            throw new ApiException(
                    INTERNAL_SERVER_ERROR,
                    "STORAGE_FAILED",
                    "Failed to delete file",
                    Map.of("documentId", documentId, "versionId", versionId)
            );
        }
    }

    private String extractText(String fileName, byte[] content, String contentType) {
        try {
            return textExtractionPort.extract(fileName, content, contentType);
        } catch (RuntimeException exception) {
            throw new ApiException(
                    UNPROCESSABLE_ENTITY,
                    "TEXT_EXTRACTION_FAILED",
                    "Failed to extract text from file",
                    Map.of("fileName", fileName)
            );
        }
    }

    private Document indexVersion(Document saved, VersionId versionId, String extractedText) {
        try {
            int chunks = documentIndexingService.index(saved.id().value(), versionId.value(), extractedText);
            return documentPort.save(saved.markVersionIndexed(versionId, chunks, Instant.now()));
        } catch (RuntimeException exception) {
            documentPort.save(saved.markVersionFailed(versionId, Instant.now()));
            String message = exception.getMessage() == null ? "" : exception.getMessage().toLowerCase(Locale.ROOT);
            String errorCode = message.contains("embed") ? "EMBEDDING_FAILED" : "INDEXING_FAILED";
            throw new ApiException(
                    UNPROCESSABLE_ENTITY,
                    errorCode,
                    "Failed to index document version",
                    Map.of("documentId", saved.id().value(), "versionId", versionId.value())
            );
        }
    }

    private boolean matchesOwnerFilter(UserView actor, Document document, String ownerId) {
        if (ownerId == null || ownerId.isBlank()) {
            return true;
        }
        if (!aclService.isAdmin(actor)) {
            return true;
        }
        return document.ownerId().equals(ownerId);
    }

    private boolean matchesStatus(Document document, String requestedStatus) {
        if (requestedStatus == null || requestedStatus.isBlank()) {
            return true;
        }
        return documentStatus(document).equals(requestedStatus.toUpperCase(Locale.ROOT));
    }

    private boolean matchesType(Document document, String requestedType) {
        if (requestedType == null || requestedType.isBlank()) {
            return true;
        }
        return documentType(document).equalsIgnoreCase(requestedType);
    }

    private boolean matchesDateRange(Document document, Instant dateFrom, Instant dateTo) {
        Instant updatedAt = document.updatedAt();
        if (dateFrom != null && updatedAt.isBefore(dateFrom)) {
            return false;
        }
        return dateTo == null || !updatedAt.isAfter(dateTo);
    }

    private boolean matchesTag(Document document, String tag) {
        if (tag == null || tag.isBlank()) {
            return true;
        }
        String needle = tag.trim();
        return document.tags().stream().anyMatch(t -> t.equalsIgnoreCase(needle));
    }

    private Comparator<Document> sortComparator(String sortBy, String order) {
        String sortField = (sortBy == null || sortBy.isBlank()) ? "updatedAt" : sortBy;
        Comparator<Document> comparator = switch (sortField) {
            case "createdAt" -> Comparator.comparing(Document::createdAt);
            case "name" -> Comparator.comparing(Document::title, String.CASE_INSENSITIVE_ORDER);
            case "updatedAt" -> Comparator.comparing(Document::updatedAt);
            default -> throw new ApiException(UNPROCESSABLE_ENTITY, "INVALID_SORT", "Unsupported sort field", Map.of("sortBy", sortBy));
        };
        boolean ascending = "asc".equalsIgnoreCase(order);
        return ascending ? comparator : comparator.reversed();
    }

    private DocumentVersion version(Document document, VersionId versionId) {
        return document.versions().stream()
                .filter(v -> v.versionId().equals(versionId))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Version not found"));
    }

    private String documentStatus(Document document) {
        boolean hasFailed = document.versions().stream().anyMatch(version -> version.indexStatus() == IndexStatus.FAILED);
        if (hasFailed) {
            return IndexStatus.FAILED.name();
        }
        boolean hasPending = document.versions().stream().anyMatch(version -> version.indexStatus() == IndexStatus.PENDING);
        return hasPending ? IndexStatus.PENDING.name() : IndexStatus.INDEXED.name();
    }

    private String documentType(Document document) {
        return document.latestVersion().contentType();
    }

    private DocumentDtos.DocumentView toView(Document document) {
        VersionId latestVersionId = document.latestVersion().versionId();
        String fullText = document.fullExtractedText();
        int fullLen = fullText.length();
        boolean truncated = fullLen > extractedTextPreviewMaxChars;
        String preview = truncated ? fullText.substring(0, extractedTextPreviewMaxChars) : fullText;
        return new DocumentDtos.DocumentView(
                document.id().value(),
                document.title(),
                document.ownerId(),
                document.description(),
                document.tags(),
                document.source(),
                document.category(),
                documentStatus(document),
                documentType(document),
                document.createdAt(),
                document.updatedAt(),
                document.versionCount(),
                document.totalSizeBytes(),
                document.lastVersionAt(),
                document.versions().stream().map(version -> new DocumentDtos.DocumentVersionView(
                        version.versionId().value(),
                        version.fileName(),
                        version.contentType(),
                        version.sizeBytes(),
                        version.storageRef(),
                        version.createdAt(),
                        version.indexStatus().name(),
                        version.indexedChunkCount(),
                        version.indexedAt(),
                        version.versionId().equals(latestVersionId)
                )).toList(),
                document.latestVersion().storageRef(),
                preview,
                fullLen,
                truncated
        );
    }
}
