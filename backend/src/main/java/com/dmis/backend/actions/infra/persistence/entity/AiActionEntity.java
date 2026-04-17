package com.dmis.backend.actions.infra.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "ai_actions")
public class AiActionEntity {
    @Id
    @Column(name = "id", nullable = false)
    private String id;

    @Column(name = "intent", nullable = false)
    private String intent;

    @Column(name = "entities_json", nullable = false, columnDefinition = "TEXT")
    private String entitiesJson;

    @Column(name = "actor_id", nullable = false)
    private String actorId;

    @Column(name = "status", nullable = false)
    private String status;

    @Column(name = "confirmed_by")
    private String confirmedBy;

    protected AiActionEntity() {
    }

    public AiActionEntity(String id, String intent, String entitiesJson, String actorId, String status, String confirmedBy) {
        this.id = id;
        this.intent = intent;
        this.entitiesJson = entitiesJson;
        this.actorId = actorId;
        this.status = status;
        this.confirmedBy = confirmedBy;
    }

    public String getId() {
        return id;
    }

    public String getIntent() {
        return intent;
    }

    public String getEntitiesJson() {
        return entitiesJson;
    }

    public String getActorId() {
        return actorId;
    }

    public String getStatus() {
        return status;
    }

    public String getConfirmedBy() {
        return confirmedBy;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setConfirmedBy(String confirmedBy) {
        this.confirmedBy = confirmedBy;
    }
}
