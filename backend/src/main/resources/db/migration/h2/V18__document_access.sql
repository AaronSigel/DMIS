-- Явные пермиссии на документы (READ / WRITE / OWNER) для роли VIEWER и расширенного ACL.
CREATE TABLE document_access (
    document_id  VARCHAR(64) NOT NULL,
    principal_id VARCHAR(64) NOT NULL,
    level        VARCHAR(16) NOT NULL,
    granted_by   VARCHAR(64) NOT NULL,
    granted_at   TIMESTAMP WITH TIME ZONE NOT NULL,
    PRIMARY KEY (document_id, principal_id),
    CONSTRAINT fk_document_access_document FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    CONSTRAINT fk_document_access_principal FOREIGN KEY (principal_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_document_access_granted_by FOREIGN KEY (granted_by) REFERENCES users(id)
);

CREATE INDEX idx_document_access_principal ON document_access(principal_id);
CREATE INDEX idx_document_access_document  ON document_access(document_id);
