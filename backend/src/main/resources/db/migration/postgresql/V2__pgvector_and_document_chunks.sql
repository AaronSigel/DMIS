CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE document_chunks (
    id VARCHAR(96) PRIMARY KEY,
    document_id VARCHAR(64) NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    version_id VARCHAR(32) NOT NULL,
    chunk_index INT NOT NULL,
    chunk_text TEXT NOT NULL,
    chunk_tsv tsvector GENERATED ALWAYS AS (to_tsvector('simple', chunk_text)) STORED,
    embedding vector(1024) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE UNIQUE INDEX document_chunks_doc_version_idx
    ON document_chunks (document_id, version_id, chunk_index);

CREATE INDEX document_chunks_tsv_gin
    ON document_chunks USING gin (chunk_tsv);

CREATE INDEX document_chunks_embedding_ivfflat
    ON document_chunks USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);

