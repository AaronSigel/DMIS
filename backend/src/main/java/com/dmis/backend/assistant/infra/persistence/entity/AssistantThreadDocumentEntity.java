package com.dmis.backend.assistant.infra.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "assistant_thread_documents")
public class AssistantThreadDocumentEntity {
    @Id
    @Column(name = "id", nullable = false)
    private String id;

    @Column(name = "thread_id", nullable = false)
    private String threadId;

    @Column(name = "document_id", nullable = false)
    private String documentId;

    protected AssistantThreadDocumentEntity() {
    }

    public AssistantThreadDocumentEntity(String id, String threadId, String documentId) {
        this.id = id;
        this.threadId = threadId;
        this.documentId = documentId;
    }

    public String getId() { return id; }
    public String getThreadId() { return threadId; }
    public String getDocumentId() { return documentId; }
}
