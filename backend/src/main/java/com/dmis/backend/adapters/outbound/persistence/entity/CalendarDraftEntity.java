package com.dmis.backend.integrations.infra.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "calendar_drafts")
public class CalendarDraftEntity {
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

    protected CalendarDraftEntity() {
    }

    public CalendarDraftEntity(String id, String title, String attendees, String startIso, String endIso, String createdBy) {
        this.id = id;
        this.title = title;
        this.attendees = attendees;
        this.startIso = startIso;
        this.endIso = endIso;
        this.createdBy = createdBy;
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
}
