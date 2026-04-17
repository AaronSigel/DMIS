ALTER TABLE documents
    ADD COLUMN description TEXT NOT NULL DEFAULT '';

ALTER TABLE documents
    ADD COLUMN tags TEXT NOT NULL DEFAULT '';

ALTER TABLE documents
    ADD COLUMN source VARCHAR(64) NOT NULL DEFAULT 'upload';

ALTER TABLE documents
    ADD COLUMN category VARCHAR(64) NOT NULL DEFAULT 'general';

ALTER TABLE documents
    ADD COLUMN created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE documents
    ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE documents d
SET created_at = COALESCE(
        (SELECT MIN(v.created_at) FROM document_versions v WHERE v.document_id = d.id),
        d.created_at
    ),
    updated_at = COALESCE(
        (SELECT MAX(v.created_at) FROM document_versions v WHERE v.document_id = d.id),
        d.updated_at
    );

ALTER TABLE document_versions
    ADD COLUMN index_status VARCHAR(32) NOT NULL DEFAULT 'INDEXED';

ALTER TABLE document_versions
    ADD COLUMN indexed_chunk_count INT NOT NULL DEFAULT 0;

ALTER TABLE document_versions
    ADD COLUMN indexed_at TIMESTAMP WITH TIME ZONE;

UPDATE document_versions dv
SET indexed_chunk_count = COALESCE((
        SELECT COUNT(*)
        FROM document_chunks dc
        WHERE dc.document_id = dv.document_id
          AND dc.version_id = dv.version_id
    ), 0),
    indexed_at = COALESCE((
        SELECT MAX(dc.indexed_at)
        FROM document_chunks dc
        WHERE dc.document_id = dv.document_id
          AND dc.version_id = dv.version_id
    ), dv.created_at),
    index_status = CASE
        WHEN EXISTS(
            SELECT 1
            FROM document_chunks dc
            WHERE dc.document_id = dv.document_id
              AND dc.version_id = dv.version_id
        ) THEN 'INDEXED'
        ELSE 'PENDING'
    END;
