package com.dmis.backend.assistant.infra.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "assistant_messages")
public class AssistantMessageEntity {
    @Id
    @Column(name = "id", nullable = false)
    private String id;

    @Column(name = "thread_id", nullable = false)
    private String threadId;

    @Column(name = "role", nullable = false)
    private String role;

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "document_ids", nullable = false, columnDefinition = "TEXT")
    private String documentIds;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected AssistantMessageEntity() {
    }

    public AssistantMessageEntity(String id, String threadId, String role, String content, String documentIds, Instant createdAt) {
        this.id = id;
        this.threadId = threadId;
        this.role = role;
        this.content = content;
        this.documentIds = documentIds;
        this.createdAt = createdAt;
    }

    public String getId() { return id; }
    public String getThreadId() { return threadId; }
    public String getRole() { return role; }
    public String getContent() { return content; }
    public String getDocumentIds() { return documentIds; }
    public Instant getCreatedAt() { return createdAt; }
}
