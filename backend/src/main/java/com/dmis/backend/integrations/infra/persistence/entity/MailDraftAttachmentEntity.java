package com.dmis.backend.integrations.infra.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;

import java.io.Serializable;
import java.util.Objects;

@Entity
@Table(name = "mail_draft_attachments")
@IdClass(MailDraftAttachmentEntity.Key.class)
public class MailDraftAttachmentEntity {

    @Id
    @Column(name = "draft_id", nullable = false)
    private String draftId;

    @Id
    @Column(name = "document_id", nullable = false)
    private String documentId;

    protected MailDraftAttachmentEntity() {
    }

    public MailDraftAttachmentEntity(String draftId, String documentId) {
        this.draftId = draftId;
        this.documentId = documentId;
    }

    public String getDraftId() {
        return draftId;
    }

    public String getDocumentId() {
        return documentId;
    }

    public static final class Key implements Serializable {
        private String draftId;
        private String documentId;

        protected Key() {
        }

        public Key(String draftId, String documentId) {
            this.draftId = draftId;
            this.documentId = documentId;
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            Key key = (Key) o;
            return Objects.equals(draftId, key.draftId) && Objects.equals(documentId, key.documentId);
        }

        @Override
        public int hashCode() {
            return Objects.hash(draftId, documentId);
        }
    }
}
