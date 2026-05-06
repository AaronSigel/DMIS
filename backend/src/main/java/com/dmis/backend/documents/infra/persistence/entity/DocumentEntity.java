package com.dmis.backend.documents.infra.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "documents")
public class DocumentEntity {
    @Id
    @Column(name = "id", nullable = false)
    private String id;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "owner_id", nullable = false)
    private String ownerId;

    @Column(name = "storage_ref", nullable = false)
    private String storageRef;

    @Column(name = "extracted_text", nullable = false, columnDefinition = "TEXT")
    private String extractedText;

    @Column(name = "description", nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "tags", nullable = false, columnDefinition = "TEXT")
    private String tags;

    @Column(name = "source", nullable = false)
    private String source;

    @Column(name = "category", nullable = false)
    private String category;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(name = "content_type", nullable = false)
    private String contentType;

    @Column(name = "size_bytes", nullable = false)
    private long sizeBytes;

    @Column(name = "index_status", nullable = false)
    private String indexStatus;

    @Column(name = "indexed_chunk_count", nullable = false)
    private int indexedChunkCount;

    @Column(name = "indexed_at")
    private Instant indexedAt;

    protected DocumentEntity() {
    }

    public DocumentEntity(
            String id,
            String title,
            String ownerId,
            String storageRef,
            String extractedText,
            String description,
            String tags,
            String source,
            String category,
            Instant createdAt,
            Instant updatedAt,
            String fileName,
            String contentType,
            long sizeBytes,
            String indexStatus,
            int indexedChunkCount,
            Instant indexedAt
    ) {
        this.id = id;
        this.title = title;
        this.ownerId = ownerId;
        this.storageRef = storageRef;
        this.extractedText = extractedText;
        this.description = description;
        this.tags = tags;
        this.source = source;
        this.category = category;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.fileName = fileName;
        this.contentType = contentType;
        this.sizeBytes = sizeBytes;
        this.indexStatus = indexStatus;
        this.indexedChunkCount = indexedChunkCount;
        this.indexedAt = indexedAt;
    }

    public String getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getOwnerId() {
        return ownerId;
    }

    public String getStorageRef() {
        return storageRef;
    }

    public String getExtractedText() {
        return extractedText;
    }

    public String getDescription() {
        return description;
    }

    public String getTags() {
        return tags;
    }

    public String getSource() {
        return source;
    }

    public String getCategory() {
        return category;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setStorageRef(String storageRef) {
        this.storageRef = storageRef;
    }

    public void setExtractedText(String extractedText) {
        this.extractedText = extractedText;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
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

    public String getIndexStatus() {
        return indexStatus;
    }

    public int getIndexedChunkCount() {
        return indexedChunkCount;
    }

    public Instant getIndexedAt() {
        return indexedAt;
    }
}
