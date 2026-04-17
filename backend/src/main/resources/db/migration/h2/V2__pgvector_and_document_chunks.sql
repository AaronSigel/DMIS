CREATE TABLE document_chunks (
    id VARCHAR(96) PRIMARY KEY,
    document_id VARCHAR(64) NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    version_id VARCHAR(32) NOT NULL,
    chunk_index INT NOT NULL,
    chunk_text CLOB NOT NULL,
    embedding CLOB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE UNIQUE INDEX document_chunks_doc_version_idx
    ON document_chunks (document_id, version_id, chunk_index);

