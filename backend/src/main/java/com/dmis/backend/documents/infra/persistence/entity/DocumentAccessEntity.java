package com.dmis.backend.documents.infra.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;

import java.io.Serializable;
import java.time.Instant;
import java.util.Objects;

/**
 * JPA-сущность таблицы {@code document_access}: явные пермиссии (READ / WRITE / OWNER)
 * на документ. Первичный ключ составной — {@code (document_id, principal_id)}.
 */
@Entity
@Table(name = "document_access")
@IdClass(DocumentAccessEntity.DocumentAccessId.class)
public class DocumentAccessEntity {

    @Id
    @Column(name = "document_id", nullable = false, length = 64)
    private String documentId;

    @Id
    @Column(name = "principal_id", nullable = false, length = 64)
    private String principalId;

    @Column(name = "level", nullable = false, length = 16)
    private String level;

    @Column(name = "granted_by", nullable = false, length = 64)
    private String grantedBy;

    @Column(name = "granted_at", nullable = false)
    private Instant grantedAt;

    protected DocumentAccessEntity() {
    }

    public DocumentAccessEntity(String documentId, String principalId, String level, String grantedBy, Instant grantedAt) {
        this.documentId = documentId;
        this.principalId = principalId;
        this.level = level;
        this.grantedBy = grantedBy;
        this.grantedAt = grantedAt;
    }

    public String getDocumentId() {
        return documentId;
    }

    public String getPrincipalId() {
        return principalId;
    }

    public String getLevel() {
        return level;
    }

    public String getGrantedBy() {
        return grantedBy;
    }

    public Instant getGrantedAt() {
        return grantedAt;
    }

    public void setLevel(String level) {
        this.level = level;
    }

    public void setGrantedBy(String grantedBy) {
        this.grantedBy = grantedBy;
    }

    public void setGrantedAt(Instant grantedAt) {
        this.grantedAt = grantedAt;
    }

    /** Составной идентификатор для {@link jakarta.persistence.IdClass}. */
    public static class DocumentAccessId implements Serializable {
        private String documentId;
        private String principalId;

        public DocumentAccessId() {
        }

        public DocumentAccessId(String documentId, String principalId) {
            this.documentId = documentId;
            this.principalId = principalId;
        }

        public String getDocumentId() {
            return documentId;
        }

        public String getPrincipalId() {
            return principalId;
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (!(o instanceof DocumentAccessId that)) return false;
            return Objects.equals(documentId, that.documentId) && Objects.equals(principalId, that.principalId);
        }

        @Override
        public int hashCode() {
            return Objects.hash(documentId, principalId);
        }
    }
}
