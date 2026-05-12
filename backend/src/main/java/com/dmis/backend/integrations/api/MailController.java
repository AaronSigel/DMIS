package com.dmis.backend.integrations.api;

import com.dmis.backend.documents.application.dto.DocumentDtos;
import com.dmis.backend.integrations.application.IntegrationService;
import com.dmis.backend.integrations.application.dto.IntegrationDtos;
import com.dmis.backend.platform.security.CurrentUserProvider;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/mail")
@Validated
public class MailController {
    private final IntegrationService integrationService;
    private final CurrentUserProvider currentUserProvider;

    public MailController(IntegrationService integrationService, CurrentUserProvider currentUserProvider) {
        this.integrationService = integrationService;
        this.currentUserProvider = currentUserProvider;
    }

    @GetMapping("/messages")
    public List<IntegrationDtos.MailMessageSummaryView> listMailMessages(
            @RequestParam(value = "mailbox", required = false, defaultValue = "") String mailbox,
            @RequestParam(value = "folder", required = false, defaultValue = "") String folderRaw
    ) {
        return integrationService.listMailMessages(currentUserProvider.currentUser(), resolveMailbox(mailbox), folderRaw);
    }

    @GetMapping("/messages/{id}")
    public IntegrationDtos.MailMessageDetailView getMailMessage(
            @PathVariable("id") @NotBlank String id,
            @RequestParam(value = "mailbox", required = false, defaultValue = "") String mailbox
    ) {
        return integrationService.getMailMessage(currentUserProvider.currentUser(), resolveMailbox(mailbox), id);
    }

    @PostMapping("/messages/search")
    public IntegrationDtos.MailMessageSearchView searchMailMessages(@Valid @RequestBody MailSearchRequest request) {
        IntegrationDtos.MailMessageSearchRequest searchRequest = new IntegrationDtos.MailMessageSearchRequest(
                request.query(),
                request.limit(),
                request.folder()
        );
        return integrationService.searchMailMessages(
                currentUserProvider.currentUser(),
                resolveMailbox(request.mailbox()),
                searchRequest
        );
    }

    @GetMapping("/drafts")
    public List<IntegrationDtos.MailDraftView> listDrafts() {
        return integrationService.listMailDrafts(currentUserProvider.currentUser());
    }

    @PostMapping("/drafts")
    public IntegrationDtos.MailDraftView createDraft(@Valid @RequestBody MailComposeRequest request) {
        return integrationService.createMailDraft(
                currentUserProvider.currentUser(),
                request.to(),
                request.subject(),
                request.body(),
                request.attachmentDocumentIds()
        );
    }

    @PutMapping("/drafts/{id}")
    public IntegrationDtos.MailDraftView updateDraft(
            @PathVariable("id") @NotBlank String id,
            @Valid @RequestBody MailDraftUpdateRequest request
    ) {
        return integrationService.updateMailDraft(
                currentUserProvider.currentUser(),
                id,
                request.to(),
                request.subject(),
                request.body(),
                request.attachmentDocumentIds()
        );
    }

    @PostMapping("/drafts/{id}/send")
    public IntegrationDtos.MailDraftView sendDraft(@PathVariable("id") @NotBlank String id) {
        return integrationService.sendSavedMailDraft(currentUserProvider.currentUser(), id);
    }

    @PostMapping("/messages/{id}/reply-draft")
    public IntegrationDtos.MailDraftView replyDraft(
            @PathVariable("id") @NotBlank String messageId,
            @RequestParam(value = "mailbox", required = false, defaultValue = "") String mailbox
    ) {
        return integrationService.createReplyDraft(currentUserProvider.currentUser(), resolveMailbox(mailbox), messageId);
    }

    @PostMapping("/messages/{id}/forward-draft")
    public IntegrationDtos.MailDraftView forwardDraft(
            @PathVariable("id") @NotBlank String messageId,
            @RequestParam(value = "mailbox", required = false, defaultValue = "") String mailbox
    ) {
        return integrationService.createForwardDraft(currentUserProvider.currentUser(), resolveMailbox(mailbox), messageId);
    }

    @GetMapping("/messages/{messageId}/attachments/{partId}")
    public ResponseEntity<byte[]> downloadAttachment(
            @PathVariable("messageId") @NotBlank String messageId,
            @PathVariable("partId") @NotBlank String partId,
            @RequestParam(value = "mailbox", required = false, defaultValue = "") String mailbox
    ) {
        var actor = currentUserProvider.currentUser();
        String mb = resolveMailbox(mailbox);
        IntegrationDtos.MailMessageDetailView detail = integrationService.getMailMessage(actor, mb, messageId);
        IntegrationDtos.MailAttachmentPartView part = detail.attachments().stream()
                .filter(p -> partId.equals(p.partId()))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "Attachment not found"));
        byte[] bytes = integrationService.readMailAttachment(actor, mb, messageId, partId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + escapeFilename(part.fileName()) + "\"")
                .contentType(MediaType.parseMediaType(part.contentType()))
                .body(bytes);
    }

    @PostMapping("/messages/{messageId}/attachments/{partId}/save-to-documents")
    public DocumentDtos.DocumentView saveAttachmentToDocuments(
            @PathVariable("messageId") @NotBlank String messageId,
            @PathVariable("partId") @NotBlank String partId,
            @RequestParam(value = "mailbox", required = false, defaultValue = "") String mailbox,
            @RequestBody(required = false) SaveAttachmentRequest body
    ) {
        String hint = body == null ? null : body.fileName();
        return integrationService.saveMailAttachmentToDocuments(
                currentUserProvider.currentUser(),
                resolveMailbox(mailbox),
                messageId,
                partId,
                hint
        );
    }

    @PostMapping("/threads/{threadId}/summary")
    public IntegrationDtos.MailThreadSummaryView threadSummary(
            @PathVariable("threadId") @NotBlank String threadId,
            @RequestParam(value = "mailbox", required = false, defaultValue = "") String mailbox,
            @RequestBody(required = false) IntegrationDtos.MailThreadSummaryRequest body
    ) {
        return integrationService.summarizeMailThread(
                currentUserProvider.currentUser(),
                resolveMailbox(mailbox),
                threadId,
                body == null ? new IntegrationDtos.MailThreadSummaryRequest(List.of()) : body
        );
    }

    @GetMapping("/account")
    public IntegrationDtos.MailAccountView getMailAccount() {
        return integrationService.getMailAccount(currentUserProvider.currentUser());
    }

    @PutMapping("/account")
    public IntegrationDtos.MailAccountView upsertMailAccount(@Valid @RequestBody MailAccountUpsertRequest request) {
        return integrationService.upsertMailAccount(
                currentUserProvider.currentUser(),
                request.imapUsername(),
                request.password(),
                request.imapHost(),
                request.imapPort()
        );
    }

    @org.springframework.web.bind.annotation.DeleteMapping("/account")
    public ResponseEntity<Void> deleteMailAccount() {
        integrationService.deleteMailAccount(currentUserProvider.currentUser());
        return ResponseEntity.noContent().build();
    }

    private String resolveMailbox(String mailbox) {
        if (mailbox == null || mailbox.isBlank()) {
            return currentUserProvider.currentUser().email();
        }
        return mailbox;
    }

    private static String escapeFilename(String name) {
        return name == null ? "file" : name.replace("\"", "'");
    }

    public record MailComposeRequest(
            String to,
            String subject,
            String body,
            List<String> attachmentDocumentIds
    ) {
    }

    public record MailDraftUpdateRequest(
            String to,
            String subject,
            String body,
            List<String> attachmentDocumentIds
    ) {
    }

    public record MailSearchRequest(
            @NotBlank String query,
            String mailbox,
            int limit,
            String folder
    ) {
    }

    public record SaveAttachmentRequest(String fileName) {
    }

    public record MailAccountUpsertRequest(
            String imapHost,
            Integer imapPort,
            String imapUsername,
            String password
    ) {
    }
}
