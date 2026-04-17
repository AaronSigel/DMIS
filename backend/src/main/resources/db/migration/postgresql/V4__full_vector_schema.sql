ALTER TABLE document_versions
    ADD CONSTRAINT document_versions_document_version_uk
        UNIQUE (document_id, version_id);

ALTER TABLE document_chunks
    ADD COLUMN embedding_model VARCHAR(255) NOT NULL DEFAULT '/models/bge-m3';

ALTER TABLE document_chunks
    ADD COLUMN embedding_dim INT NOT NULL DEFAULT 1024;

ALTER TABLE document_chunks
    ADD COLUMN embedding_normalized BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE document_chunks
    ADD COLUMN indexed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE document_chunks
SET indexed_at = COALESCE(created_at, indexed_at);

ALTER TABLE document_chunks
    ADD CONSTRAINT document_chunks_version_fk
        FOREIGN KEY (document_id, version_id)
            REFERENCES document_versions(document_id, version_id)
            ON DELETE CASCADE;

ALTER TABLE document_chunks
    ADD CONSTRAINT document_chunks_chunk_index_ck
        CHECK (chunk_index >= 0);

ALTER TABLE document_chunks
    ADD CONSTRAINT document_chunks_embedding_dim_ck
        CHECK (embedding_dim = 1024);

CREATE INDEX document_chunks_doc_version_created_idx
    ON document_chunks (document_id, version_id, created_at DESC);
