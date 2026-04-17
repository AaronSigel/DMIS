package com.dmis.backend.documents.api;

import com.dmis.backend.documents.application.DocumentUseCases;
import com.dmis.backend.documents.application.dto.DocumentDtos;
import com.dmis.backend.platform.security.CurrentUserProvider;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.List;

import static org.springframework.http.HttpStatus.BAD_REQUEST;

@RestController
@RequestMapping("/api/documents")
public class DocumentsController {
    private final DocumentUseCases documentUseCases;
    private final CurrentUserProvider currentUserProvider;

    public DocumentsController(DocumentUseCases documentUseCases, CurrentUserProvider currentUserProvider) {
        this.documentUseCases = documentUseCases;
        this.currentUserProvider = currentUserProvider;
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
    public List<DocumentDtos.DocumentView> list() {
        return documentUseCases.list(currentUserProvider.currentUser());
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

    private static void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(BAD_REQUEST, "File is required");
        }
        String fileName = file.getOriginalFilename();
        if (fileName == null || fileName.isBlank()) {
            throw new ResponseStatusException(BAD_REQUEST, "File name is required");
        }
        String contentType = file.getContentType();
        if (contentType == null || contentType.isBlank()) {
            throw new ResponseStatusException(BAD_REQUEST, "Content type is required");
        }
    }
}
