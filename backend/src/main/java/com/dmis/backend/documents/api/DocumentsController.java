package com.dmis.backend.documents.api;

import com.dmis.backend.documents.application.DocumentService;
import com.dmis.backend.documents.application.dto.DocumentDtos;
import com.dmis.backend.platform.security.CurrentUserProvider;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/documents")
public class DocumentsController {
    private final DocumentService documentService;
    private final CurrentUserProvider currentUserProvider;

    public DocumentsController(DocumentService documentService, CurrentUserProvider currentUserProvider) {
        this.documentService = documentService;
        this.currentUserProvider = currentUserProvider;
    }

    @PostMapping
    public DocumentDtos.DocumentView upload(
            @RequestParam("file") MultipartFile file
    ) throws IOException {
        return documentService.upload(
                currentUserProvider.currentUser(),
                file.getOriginalFilename(),
                file.getBytes(),
                file.getContentType()
        );
    }

    @GetMapping
    public List<DocumentDtos.DocumentView> list() {
        return documentService.list(currentUserProvider.currentUser());
    }

    @GetMapping("/{documentId}")
    public DocumentDtos.DocumentView get(@PathVariable String documentId) {
        return documentService.get(currentUserProvider.currentUser(), documentId);
    }

    @PostMapping("/{documentId}/versions")
    public DocumentDtos.DocumentView addVersion(
            @PathVariable String documentId,
            @RequestParam("file") MultipartFile file
    ) throws IOException {
        return documentService.addVersion(
                currentUserProvider.currentUser(),
                documentId,
                file.getOriginalFilename(),
                file.getBytes(),
                file.getContentType()
        );
    }
}
