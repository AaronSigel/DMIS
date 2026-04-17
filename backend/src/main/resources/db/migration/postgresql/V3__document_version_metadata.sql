ALTER TABLE document_versions
    ADD COLUMN content_type VARCHAR(255) NOT NULL DEFAULT 'application/octet-stream';

ALTER TABLE document_versions
    ADD COLUMN size_bytes BIGINT NOT NULL DEFAULT 0;

ALTER TABLE document_versions
    ADD COLUMN storage_ref TEXT NOT NULL DEFAULT '';

ALTER TABLE document_versions
    ADD COLUMN extracted_text TEXT NOT NULL DEFAULT '';

UPDATE document_versions dv
SET content_type = COALESCE(dv.content_type, 'application/octet-stream'),
    storage_ref = COALESCE(NULLIF(d.storage_ref, ''), dv.storage_ref),
    extracted_text = COALESCE(d.extracted_text, dv.extracted_text)
FROM documents d
WHERE d.id = dv.document_id;
