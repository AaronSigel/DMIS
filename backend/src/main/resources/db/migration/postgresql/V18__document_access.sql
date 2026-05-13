-- Явные пермиссии на документы (READ / WRITE / OWNER) для роли VIEWER и расширенного ACL.
CREATE TABLE document_access (
    document_id  VARCHAR(64) NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    principal_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    level        VARCHAR(16) NOT NULL,
    granted_by   VARCHAR(64) NOT NULL REFERENCES users(id),
    granted_at   TIMESTAMP WITH TIME ZONE NOT NULL,
    PRIMARY KEY (document_id, principal_id)
);

CREATE INDEX idx_document_access_principal ON document_access(principal_id);
CREATE INDEX idx_document_access_document  ON document_access(document_id);
