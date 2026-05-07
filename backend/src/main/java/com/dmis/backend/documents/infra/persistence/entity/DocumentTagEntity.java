package com.dmis.backend.documents.infra.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "document_tags")
public class DocumentTagEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "document_id", nullable = false)
    private DocumentEntity document;

    @Column(name = "tag", nullable = false)
    private String tag;

    @Column(name = "tag_norm", nullable = false)
    private String tagNorm;

    protected DocumentTagEntity() {
    }

    public DocumentTagEntity(DocumentEntity document, String tag, String tagNorm) {
        this.document = document;
        this.tag = tag;
        this.tagNorm = tagNorm;
    }

    public String getTag() {
        return tag;
    }

    public String getTagNorm() {
        return tagNorm;
    }
}
