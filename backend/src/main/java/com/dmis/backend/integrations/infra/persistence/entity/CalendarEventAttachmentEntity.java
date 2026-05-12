package com.dmis.backend.integrations.infra.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "calendar_event_attachments")
public class CalendarEventAttachmentEntity {
    @Id
    @Column(name = "id", nullable = false)
    private String id;

    @Column(name = "event_id", nullable = false)
    private String eventId;

    @Column(name = "document_id", nullable = false)
    private String documentId;

    @Column(name = "role", nullable = false)
    private String role;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected CalendarEventAttachmentEntity() {
    }

    public CalendarEventAttachmentEntity(String id, String eventId, String documentId, String role, Instant createdAt) {
        this.id = id;
        this.eventId = eventId;
        this.documentId = documentId;
        this.role = role;
        this.createdAt = createdAt;
    }

    public String getId() {
        return id;
    }

    public String getEventId() {
        return eventId;
    }

    public String getDocumentId() {
        return documentId;
    }

    public String getRole() {
        return role;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
