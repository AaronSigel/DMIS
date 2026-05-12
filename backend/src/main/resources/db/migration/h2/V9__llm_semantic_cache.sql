-- H2 не поддерживает pgvector, поэтому для тестов используем упрощенную схему
CREATE TABLE llm_cache (
    id VARCHAR(64) PRIMARY KEY,
    question_text TEXT NOT NULL,
    context_fingerprint VARCHAR(64) NOT NULL,
    answer TEXT NOT NULL,
    provider VARCHAR(64),
    model VARCHAR(128),
    sources CLOB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    accessed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    access_count INT NOT NULL DEFAULT 1
);

CREATE INDEX llm_cache_created_at_idx ON llm_cache (created_at);
CREATE INDEX llm_cache_context_fingerprint_idx ON llm_cache (context_fingerprint);
