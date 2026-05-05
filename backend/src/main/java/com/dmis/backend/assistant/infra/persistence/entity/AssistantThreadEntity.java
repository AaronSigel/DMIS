package com.dmis.backend.assistant.infra.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "assistant_threads")
public class AssistantThreadEntity {
    @Id
    @Column(name = "id", nullable = false)
    private String id;

    @Column(name = "owner_id", nullable = false)
    private String ownerId;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "ideology_profile_id", nullable = false)
    private String ideologyProfileId;

    @Column(name = "knowledge_source_ids", nullable = false, columnDefinition = "TEXT")
    private String knowledgeSourceIds;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected AssistantThreadEntity() {
    }

    public AssistantThreadEntity(String id, String ownerId, String title, String ideologyProfileId, String knowledgeSourceIds, Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.ownerId = ownerId;
        this.title = title;
        this.ideologyProfileId = ideologyProfileId;
        this.knowledgeSourceIds = knowledgeSourceIds;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public String getId() { return id; }
    public String getOwnerId() { return ownerId; }
    public String getTitle() { return title; }
    public String getIdeologyProfileId() { return ideologyProfileId; }
    public String getKnowledgeSourceIds() { return knowledgeSourceIds; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
