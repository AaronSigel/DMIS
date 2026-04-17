ALTER TABLE document_versions
    ADD COLUMN content_type VARCHAR(255) DEFAULT 'application/octet-stream' NOT NULL;

ALTER TABLE document_versions
    ADD COLUMN size_bytes BIGINT DEFAULT 0 NOT NULL;

ALTER TABLE document_versions
    ADD COLUMN storage_ref TEXT DEFAULT '' NOT NULL;

ALTER TABLE document_versions
    ADD COLUMN extracted_text TEXT DEFAULT '' NOT NULL;

UPDATE document_versions
SET content_type = COALESCE(content_type, 'application/octet-stream'),
    storage_ref = COALESCE((SELECT d.storage_ref FROM documents d WHERE d.id = document_versions.document_id), storage_ref),
    extracted_text = COALESCE((SELECT d.extracted_text FROM documents d WHERE d.id = document_versions.document_id), extracted_text);
