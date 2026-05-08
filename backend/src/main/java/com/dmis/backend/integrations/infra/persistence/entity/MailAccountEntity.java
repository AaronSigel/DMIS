package com.dmis.backend.integrations.infra.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "mail_accounts")
public class MailAccountEntity {
    @Id
    @Column(name = "owner_id", nullable = false)
    private String ownerId;

    @Column(name = "imap_host", nullable = false)
    private String imapHost;

    @Column(name = "imap_port", nullable = false)
    private int imapPort;

    @Column(name = "imap_username", nullable = false)
    private String imapUsername;

    @Column(name = "encrypted_password", nullable = false, columnDefinition = "TEXT")
    private String encryptedPassword;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected MailAccountEntity() {
    }

    public MailAccountEntity(
            String ownerId,
            String imapHost,
            int imapPort,
            String imapUsername,
            String encryptedPassword,
            Instant updatedAt
    ) {
        this.ownerId = ownerId;
        this.imapHost = imapHost;
        this.imapPort = imapPort;
        this.imapUsername = imapUsername;
        this.encryptedPassword = encryptedPassword;
        this.updatedAt = updatedAt;
    }

    public String getOwnerId() {
        return ownerId;
    }

    public String getImapHost() {
        return imapHost;
    }

    public int getImapPort() {
        return imapPort;
    }

    public String getImapUsername() {
        return imapUsername;
    }

    public String getEncryptedPassword() {
        return encryptedPassword;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}

