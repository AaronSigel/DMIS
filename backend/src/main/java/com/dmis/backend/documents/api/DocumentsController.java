package com.dmis.backend.documents.api;

import com.dmis.backend.documents.application.DocumentUseCases;
import com.dmis.backend.documents.application.dto.DocumentDtos;
import com.dmis.backend.platform.error.ApiException;
import com.dmis.backend.platform.security.CurrentUserProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.Set;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.PAYLOAD_TOO_LARGE;

@RestController
@RequestMapping("/api/documents")
public class DocumentsController {
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("pdf", "docx", "txt");
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/plain"
    );

    private final DocumentUseCases documentUseCases;
    private final CurrentUserProvider currentUserProvider;
    private final long maxFileSizeBytes;

    public DocumentsController(
            DocumentUseCases documentUseCases,
            CurrentUserProvider currentUserProvider,
            @Value("${documents.upload.max-size-bytes:20971520}") long maxFileSizeBytes
    ) {
        this.documentUseCases = documentUseCases;
        this.currentUserProvider = currentUserProvider;
        this.maxFileSizeBytes = maxFileSizeBytes;
    }

    @PostMapping
    public DocumentDtos.DocumentView upload(
            @RequestParam("file") MultipartFile file
    ) throws IOException {
        validateFile(file);
        return documentUseCases.upload(
                currentUserProvider.currentUser(),
                file.getOriginalFilename(),
                file.getBytes(),
                file.getContentType()
        );
    }

    @GetMapping
    public List<DocumentDtos.DocumentView> list(
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "type", required = false) String type,
            @RequestParam(value = "dateFrom", required = false) Instant dateFrom,
            @RequestParam(value = "dateTo", required = false) Instant dateTo,
            @RequestParam(value = "sortBy", required = false) String sortBy,
            @RequestParam(value = "order", required = false) String order
    ) {
        return documentUseCases.list(
                currentUserProvider.currentUser(),
                new DocumentDtos.DocumentListQuery(status, type, dateFrom, dateTo, sortBy, order)
        );
    }

    @GetMapping("/{documentId}")
    public DocumentDtos.DocumentView get(@PathVariable("documentId") String documentId) {
        return documentUseCases.get(currentUserProvider.currentUser(), documentId);
    }

    @PostMapping("/{documentId}/versions")
    public DocumentDtos.DocumentView addVersion(
            @PathVariable("documentId") String documentId,
            @RequestParam("file") MultipartFile file
    ) throws IOException {
        validateFile(file);
        return documentUseCases.addVersion(
                currentUserProvider.currentUser(),
                documentId,
                file.getOriginalFilename(),
                file.getBytes(),
                file.getContentType()
        );
    }

    @DeleteMapping("/{documentId}")
    public ResponseEntity<Void> delete(@PathVariable("documentId") String documentId) {
        documentUseCases.delete(currentUserProvider.currentUser(), documentId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{documentId}/binary")
    public ResponseEntity<ByteArrayResource> downloadLatest(@PathVariable("documentId") String documentId) {
        return toBinaryResponse(documentUseCases.downloadLatest(currentUserProvider.currentUser(), documentId));
    }

    @GetMapping("/{documentId}/versions/{versionId}/binary")
    public ResponseEntity<ByteArrayResource> downloadVersion(
            @PathVariable("documentId") String documentId,
            @PathVariable("versionId") String versionId
    ) {
        return toBinaryResponse(documentUseCases.downloadVersion(currentUserProvider.currentUser(), documentId, versionId));
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ApiException(BAD_REQUEST, "FILE_REQUIRED", "File is required");
        }
        String fileName = file.getOriginalFilename();
        if (fileName == null || fileName.isBlank()) {
            throw new ApiException(BAD_REQUEST, "FILE_NAME_REQUIRED", "File name is required");
        }
        String contentType = file.getContentType();
        if (contentType == null || contentType.isBlank()) {
            throw new ApiException(BAD_REQUEST, "CONTENT_TYPE_REQUIRED", "Content type is required");
        }
        if (file.getSize() > maxFileSizeBytes) {
            throw new ApiException(
                    PAYLOAD_TOO_LARGE,
                    "FILE_TOO_LARGE",
                    "File exceeds max size of " + maxFileSizeBytes + " bytes"
            );
        }

        String extension = extractExtension(fileName);
        if (!ALLOWED_EXTENSIONS.contains(extension) || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase(Locale.ROOT))) {
            throw new ApiException(
                    BAD_REQUEST,
                    "UNSUPPORTED_FILE_TYPE",
                    "Only PDF, DOCX, and TXT files are allowed"
            );
        }
    }

    private static String extractExtension(String fileName) {
        int dot = fileName.lastIndexOf('.');
        if (dot <= 0 || dot == fileName.length() - 1) {
            return "";
        }
        return fileName.substring(dot + 1).toLowerCase(Locale.ROOT);
    }

    private static ResponseEntity<ByteArrayResource> toBinaryResponse(DocumentDtos.DocumentBinary binary) {
        ByteArrayResource body = new ByteArrayResource(binary.content());
        String contentType = binary.contentType() == null || binary.contentType().isBlank()
                ? MediaType.APPLICATION_OCTET_STREAM_VALUE
                : binary.contentType();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment().filename(binary.fileName()).build().toString())
                .contentType(MediaType.parseMediaType(contentType))
                .contentLength(binary.content().length)
                .body(body);
    }
}
