package com.dmis.backend.audit.infra.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "audit_log")
public class AuditLogEntity {
    @Id
    @Column(name = "id", nullable = false)
    private String id;

    @Column(name = "at", nullable = false)
    private Instant at;

    @Column(name = "actor_id", nullable = false)
    private String actorId;

    @Column(name = "action", nullable = false)
    private String action;

    @Column(name = "resource_type", nullable = false)
    private String resourceType;

    @Column(name = "resource_id", nullable = false)
    private String resourceId;

    @Column(name = "details", nullable = false, columnDefinition = "TEXT")
    private String details;

    protected AuditLogEntity() {
    }

    public AuditLogEntity(String id, Instant at, String actorId, String action, String resourceType, String resourceId, String details) {
        this.id = id;
        this.at = at;
        this.actorId = actorId;
        this.action = action;
        this.resourceType = resourceType;
        this.resourceId = resourceId;
        this.details = details;
    }

    public String getId() {
        return id;
    }

    public Instant getAt() {
        return at;
    }

    public String getActorId() {
        return actorId;
    }

    public String getAction() {
        return action;
    }

    public String getResourceType() {
        return resourceType;
    }

    public String getResourceId() {
        return resourceId;
    }

    public String getDetails() {
        return details;
    }
}
