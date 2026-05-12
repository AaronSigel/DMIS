package com.dmis.backend.integrations.application.port;

import java.util.List;
import java.util.Optional;

/**
 * Черновики исходящей почты и прикреплённые документы из хранилища.
 */
public interface MailDraftPort {

    List<MailDraftSummary> listByCreatedBy(String createdBy);

    Optional<MailDraftSummary> findById(String id);

    boolean existsById(String id);

    MailDraftSummary save(MailDraftSummary draft);

    void deleteById(String id);

    List<String> findAttachmentDocumentIds(String draftId);

    void replaceAttachmentDocumentIds(String draftId, List<String> documentIds);

    record MailDraftSummary(String id, String recipient, String subject, String body, String createdBy) {
    }
}
