package com.dmis.backend.integrations.application.port;

import java.time.Instant;
import java.util.Optional;

public interface MailAccountPort {
    Optional<MailAccountRecord> findByOwnerId(String ownerId);

    void upsert(MailAccountRecord record);

    void deleteByOwnerId(String ownerId);

    record MailAccountRecord(
            String ownerId,
            String imapHost,
            int imapPort,
            String imapUsername,
            String encryptedPassword,
            Instant updatedAt
    ) {
    }
}

