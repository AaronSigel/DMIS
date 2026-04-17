package com.dmis.backend.documents.infra.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

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

    protected DocumentEntity() {
    }

    public DocumentEntity(String id, String title, String ownerId, String storageRef, String extractedText) {
        this.id = id;
        this.title = title;
        this.ownerId = ownerId;
        this.storageRef = storageRef;
        this.extractedText = extractedText;
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

    public void setStorageRef(String storageRef) {
        this.storageRef = storageRef;
    }

    public void setExtractedText(String extractedText) {
        this.extractedText = extractedText;
    }
}
