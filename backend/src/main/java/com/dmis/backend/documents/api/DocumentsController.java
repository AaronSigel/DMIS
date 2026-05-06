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
import java.nio.charset.StandardCharsets;
import java.time.Instant;
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

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
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
    public DocumentDtos.PageResponse<DocumentDtos.DocumentView> list(
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "type", required = false) String type,
            @RequestParam(value = "dateFrom", required = false) Instant dateFrom,
            @RequestParam(value = "dateTo", required = false) Instant dateTo,
            @RequestParam(value = "sortBy", required = false) String sortBy,
            @RequestParam(value = "order", required = false) String order,
            @RequestParam(value = "ownerId", required = false) String ownerId,
            @RequestParam(value = "tag", required = false) String tag,
            @RequestParam(value = "page", required = false, defaultValue = "0") int page,
            @RequestParam(value = "size", required = false, defaultValue = "20") int size
    ) {
        return documentUseCases.list(
                currentUserProvider.currentUser(),
                new DocumentDtos.DocumentListQuery(status, type, dateFrom, dateTo, sortBy, order, ownerId, tag, page, size)
        );
    }

    @GetMapping(value = "/{documentId}/extracted-text", produces = MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<String> getLatestExtractedText(@PathVariable("documentId") String documentId) {
        String text = documentUseCases.getLatestExtractedText(currentUserProvider.currentUser(), documentId);
        return ResponseEntity.ok()
                .contentType(new MediaType(MediaType.TEXT_PLAIN, StandardCharsets.UTF_8))
                .body(text);
    }

    @GetMapping("/{documentId}/binary")
    public ResponseEntity<ByteArrayResource> downloadLatest(
            @PathVariable("documentId") String documentId,
            @RequestParam(value = "disposition", required = false, defaultValue = "attachment") String disposition
    ) {
        boolean inline = "inline".equalsIgnoreCase(disposition);
        return toBinaryResponse(documentUseCases.downloadLatest(currentUserProvider.currentUser(), documentId), inline);
    }

    @PatchMapping("/{documentId}")
    public DocumentDtos.DocumentView patch(
            @PathVariable("documentId") String documentId,
            @RequestBody DocumentDtos.PatchDocumentRequest body
    ) {
        return documentUseCases.patch(currentUserProvider.currentUser(), documentId, body);
    }

    @GetMapping("/{documentId}")
    public DocumentDtos.DocumentView get(@PathVariable("documentId") String documentId) {
        return documentUseCases.get(currentUserProvider.currentUser(), documentId);
    }

    @DeleteMapping("/{documentId}")
    public ResponseEntity<Void> delete(@PathVariable("documentId") String documentId) {
        documentUseCases.delete(currentUserProvider.currentUser(), documentId);
        return ResponseEntity.noContent().build();
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

    private static ResponseEntity<ByteArrayResource> toBinaryResponse(DocumentDtos.DocumentBinary binary, boolean inline) {
        ByteArrayResource body = new ByteArrayResource(binary.content());
        String contentType = binary.contentType() == null || binary.contentType().isBlank()
                ? MediaType.APPLICATION_OCTET_STREAM_VALUE
                : binary.contentType();
        ContentDisposition disposition = inline
                ? ContentDisposition.inline().filename(binary.fileName()).build()
                : ContentDisposition.attachment().filename(binary.fileName()).build();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                .contentType(MediaType.parseMediaType(contentType))
                .contentLength(binary.content().length)
                .body(body);
    }
}
