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

    @Column(name = "content_type", nullable = false)
    private String contentType;

    @Column(name = "size_bytes", nullable = false)
    private long sizeBytes;

    @Column(name = "storage_ref", nullable = false, columnDefinition = "TEXT")
    private String storageRef;

    @Column(name = "extracted_text", nullable = false, columnDefinition = "TEXT")
    private String extractedText;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected DocumentVersionEntity() {
    }

    public DocumentVersionEntity(
            String id,
            String documentId,
            String versionId,
            String fileName,
            String contentType,
            long sizeBytes,
            String storageRef,
            String extractedText,
            Instant createdAt
    ) {
        this.id = id;
        this.documentId = documentId;
        this.versionId = versionId;
        this.fileName = fileName;
        this.contentType = contentType;
        this.sizeBytes = sizeBytes;
        this.storageRef = storageRef;
        this.extractedText = extractedText;
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

    public String getContentType() {
        return contentType;
    }

    public long getSizeBytes() {
        return sizeBytes;
    }

    public String getStorageRef() {
        return storageRef;
    }

    public String getExtractedText() {
        return extractedText;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
