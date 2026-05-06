ALTER TABLE documents
    ADD COLUMN IF NOT EXISTS file_name VARCHAR(255) NOT NULL DEFAULT '';

ALTER TABLE documents
    ADD COLUMN IF NOT EXISTS content_type VARCHAR(255) NOT NULL DEFAULT 'application/octet-stream';

ALTER TABLE documents
    ADD COLUMN IF NOT EXISTS size_bytes BIGINT NOT NULL DEFAULT 0;

ALTER TABLE documents
    ADD COLUMN IF NOT EXISTS index_status VARCHAR(32) NOT NULL DEFAULT 'PENDING';

ALTER TABLE documents
    ADD COLUMN IF NOT EXISTS indexed_chunk_count INT NOT NULL DEFAULT 0;

ALTER TABLE documents
    ADD COLUMN IF NOT EXISTS indexed_at TIMESTAMP WITH TIME ZONE;

WITH latest_versions AS (
    SELECT DISTINCT ON (dv.document_id)
           dv.document_id,
           dv.file_name,
           dv.content_type,
           dv.size_bytes,
           dv.storage_ref,
           dv.extracted_text,
           dv.index_status,
           dv.indexed_chunk_count,
           dv.indexed_at
    FROM document_versions dv
    ORDER BY dv.document_id, dv.created_at DESC
)
UPDATE documents d
SET file_name = COALESCE(lv.file_name, d.title),
    content_type = COALESCE(NULLIF(lv.content_type, ''), d.content_type),
    size_bytes = COALESCE(lv.size_bytes, d.size_bytes),
    storage_ref = COALESCE(NULLIF(lv.storage_ref, ''), d.storage_ref),
    extracted_text = COALESCE(lv.extracted_text, d.extracted_text),
    index_status = COALESCE(NULLIF(lv.index_status, ''), d.index_status),
    indexed_chunk_count = COALESCE(lv.indexed_chunk_count, d.indexed_chunk_count),
    indexed_at = COALESCE(lv.indexed_at, d.indexed_at)
FROM latest_versions lv
WHERE lv.document_id = d.id;

ALTER TABLE document_chunks
    DROP CONSTRAINT IF EXISTS document_chunks_version_fk;

DROP INDEX IF EXISTS document_chunks_doc_version_idx;
DROP INDEX IF EXISTS document_chunks_doc_version_created_idx;

ALTER TABLE document_chunks
    DROP COLUMN IF EXISTS version_id;

CREATE UNIQUE INDEX IF NOT EXISTS document_chunks_doc_chunk_idx
    ON document_chunks (document_id, chunk_index);

CREATE INDEX IF NOT EXISTS document_chunks_doc_created_idx
    ON document_chunks (document_id, created_at DESC);

DROP TABLE IF EXISTS document_versions;
