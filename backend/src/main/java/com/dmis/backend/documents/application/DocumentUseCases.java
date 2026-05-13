package com.dmis.backend.documents.application;

import com.dmis.backend.audit.application.AuditService;
import com.dmis.backend.documents.application.dto.DocumentDtos;
import com.dmis.backend.documents.application.port.DocumentAccessPort;
import com.dmis.backend.documents.application.port.DocumentMalwareScanPort;
import com.dmis.backend.documents.application.port.DocumentPort;
import com.dmis.backend.documents.application.port.IndexingJobPort;
import com.dmis.backend.documents.application.port.TextExtractionPort;
import com.dmis.backend.documents.domain.model.Document;
import com.dmis.backend.documents.domain.model.DocumentId;
import com.dmis.backend.documents.domain.model.IndexStatus;
import com.dmis.backend.documents.domain.model.IndexingJob;
import com.dmis.backend.integrations.application.ObjectStorageException;
import com.dmis.backend.integrations.application.port.ObjectStoragePort;
import com.dmis.backend.platform.config.StorageProperties;
import com.dmis.backend.platform.error.ApiException;
import com.dmis.backend.shared.model.UserView;
import com.dmis.backend.shared.security.AclService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR;
import static org.springframework.http.HttpStatus.NOT_FOUND;
import static org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE;
import static org.springframework.http.HttpStatus.UNPROCESSABLE_ENTITY;

@Service
public class DocumentUseCases {
    private static final Logger log = LoggerFactory.getLogger(DocumentUseCases.class);

    private static final int DEFAULT_PAGE_SIZE = 20;
    private static final int MAX_PAGE_SIZE = 100;
    private static final int MAX_DOCUMENT_NAME_LENGTH = 255;

    private final DocumentPort documentPort;
    private final ObjectStoragePort objectStoragePort;
    private final TextExtractionPort textExtractionPort;
    private final DocumentMalwareScanPort malwareScanPort;
    private final IndexingJobPort indexingJobPort;
    private final IndexingWorker indexingWorker;
    private final AclService aclService;
    private final AuditService auditService;
    private final DocumentAccessPort documentAccessPort;
    private final StorageProperties storageProperties;
    private final int extractedTextPreviewMaxChars;
    private final boolean scanEnabled;

    public DocumentUseCases(
            DocumentPort documentPort,
            ObjectStoragePort objectStoragePort,
            TextExtractionPort textExtractionPort,
            DocumentMalwareScanPort malwareScanPort,
            IndexingJobPort indexingJobPort,
            IndexingWorker indexingWorker,
            AclService aclService,
            AuditService auditService,
            DocumentAccessPort documentAccessPort,
            StorageProperties storageProperties,
            @Value("${documents.extracted-text.preview-max-chars:2000}") int extractedTextPreviewMaxChars,
            @Value("${document.scan.enabled:false}") boolean scanEnabled
    ) {
        this.documentPort = documentPort;
        this.objectStoragePort = objectStoragePort;
        this.textExtractionPort = textExtractionPort;
        this.malwareScanPort = malwareScanPort;
        this.indexingJobPort = indexingJobPort;
        this.indexingWorker = indexingWorker;
        this.aclService = aclService;
        this.auditService = auditService;
        this.documentAccessPort = documentAccessPort;
        this.storageProperties = storageProperties;
        this.extractedTextPreviewMaxChars = Math.max(1, extractedTextPreviewMaxChars);
        this.scanEnabled = scanEnabled;
    }

    public DocumentDtos.DocumentView upload(UserView actor, String fileName, byte[] content, String contentType) {
        Instant now = Instant.now();
        ensureSafeContent(fileName, content);
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
        IndexingJob job = indexingJobPort.enqueue(saved.id().value(), now);
        auditService.append(actor.id(), "document.upload", "document", saved.id().value(), "Uploaded document");
        indexingWorker.dispatch(job.jobId());
        return toView(saved);
    }

    public DocumentDtos.PageResponse<DocumentDtos.DocumentView> list(UserView actor, DocumentDtos.DocumentListQuery query) {
        int page = Math.max(0, query.page());
        int size = query.size() > 0 ? query.size() : DEFAULT_PAGE_SIZE;
        size = Math.min(size, MAX_PAGE_SIZE);
        boolean admin = aclService.isAdmin(actor);
        boolean viewerOnly = aclService.isViewer(actor);
        List<String> grantedIds = admin ? List.of() : documentAccessPort.findAccessibleDocumentIds(actor.id());
        DocumentPort.ListQuery listQuery = new DocumentPort.ListQuery(
                admin,
                actor.id(),
                query.ownerId(),
                query.status(),
                query.type(),
                query.dateFrom(),
                query.dateTo(),
                query.tag(),
                grantedIds,
                viewerOnly
        );
        Page<Document> resultPage = documentPort.findPage(
                listQuery,
                PageRequest.of(page, size, toSort(query.sortBy(), query.order()))
        );

        return new DocumentDtos.PageResponse<>(
                resultPage.getContent().stream().map(this::toView).toList(),
                resultPage.getTotalElements(),
                resultPage.getTotalPages(),
                page,
                size
        );
    }

    public DocumentDtos.DocumentView get(UserView actor, String documentId) {
        Document document = documentPort.findById(DocumentId.from(documentId))
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Document not found"));
        aclService.requireDocumentRead(actor, document.id().value(), document.ownerId());
        return toView(document);
    }

    public Map<String, DocumentDtos.DocumentView> getAccessibleByIds(UserView actor, Collection<String> documentIds) {
        if (documentIds == null || documentIds.isEmpty()) {
            return Map.of();
        }
        List<DocumentId> ids = documentIds.stream()
                .filter(id -> id != null && !id.isBlank())
                .map(String::trim)
                .distinct()
                .map(DocumentId::from)
                .toList();
        if (ids.isEmpty()) {
            return Map.of();
        }

        Map<String, DocumentDtos.DocumentView> views = new HashMap<>();
        for (Document document : documentPort.findAllByIds(new LinkedHashSet<>(ids))) {
            if (aclService.canReadDocument(actor, document.id().value(), document.ownerId())) {
                views.put(document.id().value(), toView(document));
            }
        }
        return Map.copyOf(views);
    }

    public DocumentDtos.DocumentView patch(UserView actor, String documentId, DocumentDtos.PatchDocumentRequest request) {
        Document document = documentPort.findById(DocumentId.from(documentId))
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Document not found"));
        aclService.requireDocumentWrite(actor, document.id().value(), document.ownerId());

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
        aclService.requireDocumentRead(actor, document.id().value(), document.ownerId());
        return document.fullExtractedText();
    }

    public DocumentDtos.DocumentBinary downloadLatest(UserView actor, String documentId) {
        Document document = documentPort.findById(DocumentId.from(documentId))
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Document not found"));
        aclService.requireDocumentRead(actor, document.id().value(), document.ownerId());
        byte[] bytes = loadDocumentBinary(document);
        auditService.append(actor.id(), "document.download", "document", document.id().value(), "Downloaded latest");
        return new DocumentDtos.DocumentBinary(document.fileName(), document.contentType(), bytes);
    }

    public DocumentDtos.PresignedDownloadUrl getDownloadUrl(UserView actor, String documentId) {
        Document document = documentPort.findById(DocumentId.from(documentId))
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Document not found"));
        aclService.requireDocumentRead(actor, document.id().value(), document.ownerId());
        String storageRef = document.storageRef();
        if (storageRef != null && storageRef.startsWith("demo://")) {
            throw new ApiException(
                    BAD_REQUEST,
                    "DEMO_STORAGE_NOT_AVAILABLE",
                    "Presigned download is not available for demo placeholder documents",
                    Map.of("documentId", document.id().value())
            );
        }
        int ttlSeconds = storageProperties.presignedDownloadTtlSeconds();
        String url = presignDownload(storageRef, documentId, ttlSeconds);
        auditService.append(actor.id(), "document.download_link", "document", document.id().value(), "Issued presigned download URL");
        return new DocumentDtos.PresignedDownloadUrl(url, ttlSeconds);
    }

    public void delete(UserView actor, String documentId) {
        Document document = documentPort.findById(DocumentId.from(documentId))
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Document not found"));
        aclService.requireDocumentWrite(actor, document.id().value(), document.ownerId());
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

    /**
     * Документы с {@code demo://} не имеют объекта в MinIO; для предпросмотра/скачивания
     * отдаём байты извлечённого текста (как для демо-сидов с {@code text/plain}).
     */
    private byte[] loadDocumentBinary(Document document) {
        String storageRef = document.storageRef();
        if (storageRef != null && storageRef.startsWith("demo://")) {
            return document.fullExtractedText().getBytes(StandardCharsets.UTF_8);
        }
        return loadFile(storageRef, document.id().value());
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
        if (storageRef == null || storageRef.isBlank()) {
            log.warn("Skipping object storage delete: empty storage_ref (documentId={})", documentId);
            return;
        }
        if (!storageRef.startsWith("minio://")) {
            log.warn("Skipping object storage delete: not a MinIO ref (documentId={}, ref={})", documentId, storageRef);
            return;
        }
        try {
            objectStoragePort.delete(storageRef);
        } catch (IllegalArgumentException exception) {
            log.warn("Invalid storage reference for document {}: {}", documentId, exception.getMessage());
            throw new ApiException(
                    BAD_REQUEST,
                    "INVALID_STORAGE_REF",
                    "Invalid storage reference",
                    Map.of("documentId", documentId)
            );
        } catch (ObjectStorageException exception) {
            log.warn("Object storage delete failed (documentId={})", documentId, exception);
            HashMap<String, Object> details = new HashMap<>();
            details.put("documentId", documentId);
            if (exception.getProviderErrorCode() != null) {
                details.put("minioCode", exception.getProviderErrorCode());
            }
            throw new ApiException(
                    INTERNAL_SERVER_ERROR,
                    "STORAGE_FAILED",
                    "Failed to delete file",
                    Map.copyOf(details)
            );
        } catch (RuntimeException exception) {
            log.warn("Object storage delete failed (documentId={})", documentId, exception);
            throw new ApiException(
                    INTERNAL_SERVER_ERROR,
                    "STORAGE_FAILED",
                    "Failed to delete file",
                    Map.of("documentId", documentId)
            );
        }
    }

    private String presignDownload(String storageRef, String documentId, int ttlSeconds) {
        try {
            return objectStoragePort.presignDownload(storageRef, ttlSeconds);
        } catch (RuntimeException exception) {
            throw new ApiException(
                    INTERNAL_SERVER_ERROR,
                    "STORAGE_FAILED",
                    "Failed to generate download URL",
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

    private void ensureSafeContent(String fileName, byte[] content) {
        if (!scanEnabled) {
            return;
        }
        try {
            DocumentMalwareScanPort.ScanVerdict verdict = malwareScanPort.scan(fileName, content);
            if (verdict == DocumentMalwareScanPort.ScanVerdict.INFECTED) {
                throw new ApiException(
                        UNPROCESSABLE_ENTITY,
                        "MALWARE_DETECTED",
                        "File failed malware scan",
                        Map.of("fileName", fileName)
                );
            }
        } catch (ApiException exception) {
            throw exception;
        } catch (RuntimeException exception) {
            throw new ApiException(
                    SERVICE_UNAVAILABLE,
                    "MALWARE_SCAN_UNAVAILABLE",
                    "Malware scanner is unavailable",
                    Map.of("fileName", fileName)
            );
        }
    }

    private Sort toSort(String sortBy, String order) {
        String sortField = (sortBy == null || sortBy.isBlank()) ? "updatedAt" : sortBy;
        String property = switch (sortField) {
            case "createdAt" -> "createdAt";
            case "name" -> "title";
            case "updatedAt" -> "updatedAt";
            default -> throw new ApiException(UNPROCESSABLE_ENTITY, "INVALID_SORT", "Unsupported sort field", Map.of("sortBy", sortBy));
        };
        Sort.Direction direction = "asc".equalsIgnoreCase(order) ? Sort.Direction.ASC : Sort.Direction.DESC;
        return Sort.by(direction, property);
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
