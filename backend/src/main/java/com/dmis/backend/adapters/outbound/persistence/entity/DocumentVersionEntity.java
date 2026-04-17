package com.dmis.backend.documents.infra.persistence.entity;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "document_versions")
public class DocumentVersionEntity {
    @Id
    @Column(name = "id", nullable = false)
    private String id;

    @Column(name = "document_id", nullable = false)
    private String documentId;

    @Column(name = "version_id", nullable = false)
    private String versionId;

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected DocumentVersionEntity() {
    }

    public DocumentVersionEntity(String id, String documentId, String versionId, String fileName, Instant createdAt) {
        this.id = id;
        this.documentId = documentId;
        this.versionId = versionId;
        this.fileName = fileName;
        this.createdAt = createdAt;
    }

    public String getId() {
        return id;
    }

    public String getDocumentId() {
        return documentId;
    }

    public String getVersionId() {
        return versionId;
    }

    public String getFileName() {
        return fileName;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
