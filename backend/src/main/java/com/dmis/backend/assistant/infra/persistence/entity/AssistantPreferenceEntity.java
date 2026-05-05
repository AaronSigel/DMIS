package com.dmis.backend.assistant.infra.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "assistant_preferences")
public class AssistantPreferenceEntity {
    @Id
    @Column(name = "owner_id", nullable = false)
    private String ownerId;

    @Column(name = "ideology_profile_id", nullable = false)
    private String ideologyProfileId;

    @Column(name = "knowledge_source_ids", nullable = false, columnDefinition = "TEXT")
    private String knowledgeSourceIds;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected AssistantPreferenceEntity() {
    }

    public AssistantPreferenceEntity(String ownerId, String ideologyProfileId, String knowledgeSourceIds, Instant updatedAt) {
        this.ownerId = ownerId;
        this.ideologyProfileId = ideologyProfileId;
        this.knowledgeSourceIds = knowledgeSourceIds;
        this.updatedAt = updatedAt;
    }

    public String getOwnerId() { return ownerId; }
    public String getIdeologyProfileId() { return ideologyProfileId; }
    public String getKnowledgeSourceIds() { return knowledgeSourceIds; }
    public Instant getUpdatedAt() { return updatedAt; }
}
