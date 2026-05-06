package com.dmis.backend.assistant.api;

import com.dmis.backend.assistant.application.AssistantService;
import com.dmis.backend.assistant.application.dto.AssistantDtos;
import com.dmis.backend.platform.security.CurrentUserProvider;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/assistant")
public class AssistantController {
    private final AssistantService assistantService;
    private final CurrentUserProvider currentUserProvider;

    public AssistantController(AssistantService assistantService, CurrentUserProvider currentUserProvider) {
        this.assistantService = assistantService;
        this.currentUserProvider = currentUserProvider;
    }

    @GetMapping("/threads")
    public List<AssistantDtos.ThreadView> listThreads() {
        return assistantService.listThreads(currentUserProvider.currentUser());
    }

    @PostMapping("/threads")
    public AssistantDtos.ThreadView createThread(@RequestBody CreateThreadRequest request) {
        return assistantService.createThread(currentUserProvider.currentUser(), request.title());
    }

    @PostMapping("/threads/{threadId}/title")
    public AssistantDtos.ThreadView generateThreadTitle(@PathVariable("threadId") String threadId) {
        return assistantService.generateThreadTitle(currentUserProvider.currentUser(), threadId);
    }

    @GetMapping("/threads/{threadId}")
    public AssistantDtos.ThreadDetailView getThread(@PathVariable("threadId") String threadId) {
        return assistantService.getThread(currentUserProvider.currentUser(), threadId);
    }

    @PostMapping("/threads/{threadId}/messages")
    public AssistantDtos.SendMessageResult sendMessage(@PathVariable("threadId") String threadId, @RequestBody SendMessageRequest request) {
        return assistantService.sendMessage(
                currentUserProvider.currentUser(),
                threadId,
                request.question(),
                request.documentIds(),
                request.knowledgeSourceIds(),
                request.ideologyProfileId()
        );
    }

    @PostMapping("/threads/{threadId}/documents")
    public void linkDocument(@PathVariable("threadId") String threadId, @RequestBody LinkDocumentRequest request) {
        assistantService.linkDocument(currentUserProvider.currentUser(), threadId, request.documentId());
    }

    @DeleteMapping("/threads/{threadId}/documents/{documentId}")
    public void unlinkDocument(@PathVariable("threadId") String threadId, @PathVariable("documentId") String documentId) {
        assistantService.unlinkDocument(currentUserProvider.currentUser(), threadId, documentId);
    }

    @PostMapping(value = "/threads/{threadId}/uploads", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public AssistantDtos.MentionDocumentView uploadToThread(@PathVariable("threadId") String threadId, @RequestParam("file") MultipartFile file) throws IOException {
        return assistantService.uploadAndLink(
                currentUserProvider.currentUser(),
                threadId,
                file.getOriginalFilename(),
                file.getBytes(),
                file.getContentType()
        );
    }

    @GetMapping("/documents/mentions")
    public List<AssistantDtos.MentionDocumentView> mentions(
            @RequestParam(value = "q", required = false) String query,
            @RequestParam(value = "limit", required = false, defaultValue = "8") int limit
    ) {
        return assistantService.mentionCandidates(currentUserProvider.currentUser(), query, limit);
    }

    @GetMapping("/preferences")
    public AssistantDtos.AssistantPreferencesView preferences() {
        return assistantService.preferences(currentUserProvider.currentUser());
    }

    @PutMapping("/preferences")
    public AssistantDtos.AssistantPreferencesView savePreferences(@RequestBody SavePreferencesRequest request) {
        return assistantService.savePreferences(
                currentUserProvider.currentUser(),
                request.ideologyProfileId(),
                request.knowledgeSourceIds()
        );
    }

    public record CreateThreadRequest(String title) {
    }

    public record SendMessageRequest(
            @NotBlank String question,
            List<String> documentIds,
            List<String> knowledgeSourceIds,
            String ideologyProfileId
    ) {
    }

    public record LinkDocumentRequest(@NotBlank String documentId) {
    }

    public record SavePreferencesRequest(
            String ideologyProfileId,
            List<String> knowledgeSourceIds
    ) {
    }
}
