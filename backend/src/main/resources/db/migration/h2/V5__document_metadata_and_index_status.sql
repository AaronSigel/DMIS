ALTER TABLE documents
    ADD COLUMN description TEXT DEFAULT '' NOT NULL;

ALTER TABLE documents
    ADD COLUMN tags TEXT DEFAULT '' NOT NULL;

ALTER TABLE documents
    ADD COLUMN source VARCHAR(64) DEFAULT 'upload' NOT NULL;

ALTER TABLE documents
    ADD COLUMN category VARCHAR(64) DEFAULT 'general' NOT NULL;

ALTER TABLE documents
    ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL;

ALTER TABLE documents
    ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL;

UPDATE documents
SET created_at = COALESCE((SELECT MIN(v.created_at) FROM document_versions v WHERE v.document_id = documents.id), created_at),
    updated_at = COALESCE((SELECT MAX(v.created_at) FROM document_versions v WHERE v.document_id = documents.id), updated_at);

ALTER TABLE document_versions
    ADD COLUMN index_status VARCHAR(32) DEFAULT 'INDEXED' NOT NULL;

ALTER TABLE document_versions
    ADD COLUMN indexed_chunk_count INT DEFAULT 0 NOT NULL;

ALTER TABLE document_versions
    ADD COLUMN indexed_at TIMESTAMP WITH TIME ZONE;

UPDATE document_versions
SET indexed_chunk_count = COALESCE((
        SELECT COUNT(*)
        FROM document_chunks dc
        WHERE dc.document_id = document_versions.document_id
          AND dc.version_id = document_versions.version_id
    ), 0),
    indexed_at = COALESCE((
        SELECT MAX(dc.indexed_at)
        FROM document_chunks dc
        WHERE dc.document_id = document_versions.document_id
          AND dc.version_id = document_versions.version_id
    ), created_at),
    index_status = CASE
        WHEN EXISTS(
            SELECT 1
            FROM document_chunks dc
            WHERE dc.document_id = document_versions.document_id
              AND dc.version_id = document_versions.version_id
        ) THEN 'INDEXED'
        ELSE 'PENDING'
    END;
