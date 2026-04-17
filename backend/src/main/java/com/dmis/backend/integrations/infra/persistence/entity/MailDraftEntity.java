package com.dmis.backend.integrations.infra.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "mail_drafts")
public class MailDraftEntity {
    @Id
    @Column(name = "id", nullable = false)
    private String id;

    @Column(name = "recipient", nullable = false)
    private String recipient;

    @Column(name = "subject", nullable = false)
    private String subject;

    @Column(name = "body", nullable = false, columnDefinition = "TEXT")
    private String body;

    @Column(name = "created_by", nullable = false)
    private String createdBy;

    protected MailDraftEntity() {
    }

    public MailDraftEntity(String id, String recipient, String subject, String body, String createdBy) {
        this.id = id;
        this.recipient = recipient;
        this.subject = subject;
        this.body = body;
        this.createdBy = createdBy;
    }

    public String getId() {
        return id;
    }

    public String getRecipient() {
        return recipient;
    }

    public String getSubject() {
        return subject;
    }

    public String getBody() {
        return body;
    }

    public String getCreatedBy() {
        return createdBy;
    }
}
