ALTER TABLE documents
    ADD COLUMN IF NOT EXISTS file_name VARCHAR(255) DEFAULT '' NOT NULL;

ALTER TABLE documents
    ADD COLUMN IF NOT EXISTS content_type VARCHAR(255) DEFAULT 'application/octet-stream' NOT NULL;

ALTER TABLE documents
    ADD COLUMN IF NOT EXISTS size_bytes BIGINT DEFAULT 0 NOT NULL;

ALTER TABLE documents
    ADD COLUMN IF NOT EXISTS index_status VARCHAR(32) DEFAULT 'PENDING' NOT NULL;

ALTER TABLE documents
    ADD COLUMN IF NOT EXISTS indexed_chunk_count INT DEFAULT 0 NOT NULL;

ALTER TABLE documents
    ADD COLUMN IF NOT EXISTS indexed_at TIMESTAMP WITH TIME ZONE;

UPDATE documents d
SET file_name = COALESCE((
        SELECT dv.file_name
        FROM document_versions dv
        WHERE dv.document_id = d.id
        ORDER BY dv.created_at DESC
        LIMIT 1
    ), d.title),
    content_type = COALESCE((
        SELECT dv.content_type
        FROM document_versions dv
        WHERE dv.document_id = d.id
        ORDER BY dv.created_at DESC
        LIMIT 1
    ), d.content_type),
    size_bytes = COALESCE((
        SELECT dv.size_bytes
        FROM document_versions dv
        WHERE dv.document_id = d.id
        ORDER BY dv.created_at DESC
        LIMIT 1
    ), d.size_bytes),
    storage_ref = COALESCE((
        SELECT dv.storage_ref
        FROM document_versions dv
        WHERE dv.document_id = d.id
        ORDER BY dv.created_at DESC
        LIMIT 1
    ), d.storage_ref),
    extracted_text = COALESCE((
        SELECT dv.extracted_text
        FROM document_versions dv
        WHERE dv.document_id = d.id
        ORDER BY dv.created_at DESC
        LIMIT 1
    ), d.extracted_text),
    index_status = COALESCE((
        SELECT dv.index_status
        FROM document_versions dv
        WHERE dv.document_id = d.id
        ORDER BY dv.created_at DESC
        LIMIT 1
    ), d.index_status),
    indexed_chunk_count = COALESCE((
        SELECT dv.indexed_chunk_count
        FROM document_versions dv
        WHERE dv.document_id = d.id
        ORDER BY dv.created_at DESC
        LIMIT 1
    ), d.indexed_chunk_count),
    indexed_at = COALESCE((
        SELECT dv.indexed_at
        FROM document_versions dv
        WHERE dv.document_id = d.id
        ORDER BY dv.created_at DESC
        LIMIT 1
    ), d.indexed_at);

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
