package com.dmis.backend.documents.application;

import com.dmis.backend.audit.application.AuditService;
import com.dmis.backend.documents.application.dto.DocumentDtos;
import com.dmis.backend.documents.application.port.DocumentPort;
import com.dmis.backend.documents.application.port.TextExtractionPort;
import com.dmis.backend.documents.domain.model.Document;
import com.dmis.backend.documents.domain.model.DocumentId;
import com.dmis.backend.documents.domain.model.IndexStatus;
import com.dmis.backend.integrations.application.port.ObjectStoragePort;
import com.dmis.backend.platform.error.ApiException;
import com.dmis.backend.shared.model.UserView;
import com.dmis.backend.shared.security.AclService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.ArrayList;
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
    private static final int DEFAULT_PAGE_SIZE = 20;
    private static final int MAX_PAGE_SIZE = 100;
    private static final int MAX_DOCUMENT_NAME_LENGTH = 255;

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
        String storageRef = storeFile(objectPath(documentId, fileName), content, contentType);
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
        saved = indexDocument(saved, extractedText);
        int chunks = saved.indexedChunkCount();
        auditService.append(actor.id(), "document.upload", "document", saved.id().value(), "Uploaded document");
        auditService.append(
                actor.id(),
                "document.index",
                "document",
                saved.id().value(),
                "Indexed " + chunks + " chunks"
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

        boolean changeTags = request.tags() != null;
        boolean changeTitle = request.title() != null;
        boolean changeFileName = request.fileName() != null;
        if (!changeTags && !changeTitle && !changeFileName) {
            throw new ApiException(
                    UNPROCESSABLE_ENTITY,
                    "NO_CHANGES",
                    "At least one of tags, title, or fileName must be provided",
                    Map.of()
            );
        }

        String oldTitle = document.title();
        String oldFileName = document.fileName();
        Instant now = Instant.now();
        Document updated = document;

        if (changeTags) {
            updated = updated.withTags(request.tags(), now);
        }
        if (changeTitle) {
            String t = request.title().trim();
            if (t.isBlank()) {
                throw new ApiException(UNPROCESSABLE_ENTITY, "TITLE_INVALID", "title must be non-blank", Map.of());
            }
            if (t.length() > MAX_DOCUMENT_NAME_LENGTH) {
                throw new ApiException(
                        UNPROCESSABLE_ENTITY,
                        "TITLE_TOO_LONG",
                        "title exceeds max length",
                        Map.of("max", MAX_DOCUMENT_NAME_LENGTH)
                );
            }
            updated = updated.withTitle(t, now);
        }
        if (changeFileName) {
            String f = request.fileName().trim();
            if (f.isBlank()) {
                throw new ApiException(UNPROCESSABLE_ENTITY, "FILENAME_INVALID", "fileName must be non-blank", Map.of());
            }
            if (f.length() > MAX_DOCUMENT_NAME_LENGTH) {
                throw new ApiException(
                        UNPROCESSABLE_ENTITY,
                        "FILENAME_TOO_LONG",
                        "fileName exceeds max length",
                        Map.of("max", MAX_DOCUMENT_NAME_LENGTH)
                );
            }
            String currentExtension = fileExtension(updated.fileName());
            String newExtension = fileExtension(f);
            if (!currentExtension.equalsIgnoreCase(newExtension)) {
                throw new ApiException(
                        UNPROCESSABLE_ENTITY,
                        "FILENAME_EXTENSION_MISMATCH",
                        "fileName extension must match the current file",
                        Map.of("expectedExtension", currentExtension, "actualExtension", newExtension)
                );
            }
            updated = updated.withFileName(f, now);
        }

        Document saved = documentPort.save(updated);

        boolean titleRenamed = changeTitle && !oldTitle.equals(saved.title());
        boolean fileRenamed = changeFileName && !oldFileName.equals(saved.fileName());
        if (titleRenamed || fileRenamed) {
            List<String> renameParts = new ArrayList<>();
            if (titleRenamed) {
                renameParts.add("title: \"" + oldTitle + "\" → \"" + saved.title() + "\"");
            }
            if (fileRenamed) {
                renameParts.add("fileName: \"" + oldFileName + "\" → \"" + saved.fileName() + "\"");
            }
            if (!renameParts.isEmpty()) {
                auditService.append(actor.id(), "document.rename", "document", saved.id().value(), String.join("; ", renameParts));
            }
        }
        if (changeTags) {
            auditService.append(actor.id(), "document.patch", "document", saved.id().value(), "Updated tags");
        }
        return toView(saved);
    }

    private static String fileExtension(String fileName) {
        int dot = fileName.lastIndexOf('.');
        if (dot <= 0 || dot == fileName.length() - 1) {
            return "";
        }
        return fileName.substring(dot + 1).toLowerCase(Locale.ROOT);
    }

    public String getLatestExtractedText(UserView actor, String documentId) {
        Document document = documentPort.findById(DocumentId.from(documentId))
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Document not found"));
        aclService.requireDocumentRead(actor, document.ownerId());
        return document.fullExtractedText();
    }

    public DocumentDtos.DocumentBinary downloadLatest(UserView actor, String documentId) {
        Document document = documentPort.findById(DocumentId.from(documentId))
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Document not found"));
        aclService.requireDocumentRead(actor, document.ownerId());
        byte[] bytes = loadFile(document.storageRef(), documentId);
        auditService.append(actor.id(), "document.download", "document", document.id().value(), "Downloaded latest");
        return new DocumentDtos.DocumentBinary(document.fileName(), document.contentType(), bytes);
    }

    public void delete(UserView actor, String documentId) {
        Document document = documentPort.findById(DocumentId.from(documentId))
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Document not found"));
        aclService.requireDocumentWrite(actor, document.ownerId());
        deleteFile(document.storageRef(), document.id().value());
        documentPort.deleteById(document.id());
        auditService.append(actor.id(), "document.delete", "document", document.id().value(), "Deleted document");
    }

    private String objectPath(DocumentId documentId, String fileName) {
        return documentId.value() + "/" + fileName;
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

    private byte[] loadFile(String storageRef, String documentId) {
        try {
            return objectStoragePort.load(storageRef);
        } catch (RuntimeException exception) {
            throw new ApiException(
                    INTERNAL_SERVER_ERROR,
                    "STORAGE_FAILED",
                    "Failed to download file",
                    Map.of("documentId", documentId)
            );
        }
    }

    private void deleteFile(String storageRef, String documentId) {
        try {
            objectStoragePort.delete(storageRef);
        } catch (RuntimeException exception) {
            throw new ApiException(
                    INTERNAL_SERVER_ERROR,
                    "STORAGE_FAILED",
                    "Failed to delete file",
                    Map.of("documentId", documentId)
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

    private Document indexDocument(Document saved, String extractedText) {
        try {
            int chunks = documentIndexingService.index(saved.id().value(), extractedText);
            return documentPort.save(saved.markIndexed(chunks, Instant.now()));
        } catch (RuntimeException exception) {
            documentPort.save(saved.markFailed(Instant.now()));
            String message = exception.getMessage() == null ? "" : exception.getMessage().toLowerCase(Locale.ROOT);
            String errorCode = message.contains("embed") ? "EMBEDDING_FAILED" : "INDEXING_FAILED";
            throw new ApiException(
                    UNPROCESSABLE_ENTITY,
                    errorCode,
                    "Failed to index document",
                    Map.of("documentId", saved.id().value())
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

    private String documentStatus(Document document) {
        if (document.indexStatus() == IndexStatus.FAILED) {
            return IndexStatus.FAILED.name();
        }
        return document.indexStatus() == IndexStatus.PENDING ? IndexStatus.PENDING.name() : IndexStatus.INDEXED.name();
    }

    private String documentType(Document document) {
        return document.contentType();
    }

    private DocumentDtos.DocumentView toView(Document document) {
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
                document.totalSizeBytes(),
                document.fileName(),
                document.contentType(),
                document.storageRef(),
                document.indexedChunkCount(),
                document.indexedAt(),
                preview,
                fullLen,
                truncated
        );
    }
}
