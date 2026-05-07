package com.dmis.backend.integrations.infra.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "calendar_events")
public class CalendarEventEntity {
    @Id
    @Column(name = "id", nullable = false)
    private String id;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "attendees", nullable = false, columnDefinition = "TEXT")
    private String attendees;

    @Column(name = "start_iso", nullable = false)
    private String startIso;

    @Column(name = "end_iso", nullable = false)
    private String endIso;

    @Column(name = "created_by", nullable = false)
    private String createdBy;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected CalendarEventEntity() {
    }

    public CalendarEventEntity(
            String id,
            String title,
            String attendees,
            String startIso,
            String endIso,
            String createdBy,
            Instant createdAt,
            Instant updatedAt
    ) {
        this.id = id;
        this.title = title;
        this.attendees = attendees;
        this.startIso = startIso;
        this.endIso = endIso;
        this.createdBy = createdBy;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public String getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getAttendees() {
        return attendees;
    }

    public String getStartIso() {
        return startIso;
    }

    public String getEndIso() {
        return endIso;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
