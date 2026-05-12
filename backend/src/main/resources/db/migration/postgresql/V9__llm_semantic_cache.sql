-- Semantic cache для LLM ответов
-- Кэширует ответы на похожие вопросы для ускорения RAG пайплайна

CREATE TABLE llm_cache (
    id VARCHAR(64) PRIMARY KEY,
    question_text TEXT NOT NULL,
    question_embedding vector(1024) NOT NULL,
    context_fingerprint VARCHAR(64) NOT NULL,
    answer TEXT NOT NULL,
    provider VARCHAR(64),
    model VARCHAR(128),
    sources JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    accessed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    access_count INT NOT NULL DEFAULT 1
);

-- HNSW индекс для быстрого поиска похожих вопросов
CREATE INDEX llm_cache_embedding_hnsw
    ON llm_cache USING hnsw (question_embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);

-- Индекс для очистки старых записей
CREATE INDEX llm_cache_created_at_idx ON llm_cache (created_at);

-- Индекс для поиска по fingerprint (контекст должен совпадать)
CREATE INDEX llm_cache_context_fingerprint_idx ON llm_cache (context_fingerprint);

-- Комментарии
COMMENT ON TABLE llm_cache IS 'Semantic cache для LLM ответов с векторным поиском похожих вопросов';
COMMENT ON COLUMN llm_cache.question_embedding IS 'Embedding вопроса для поиска похожих';
COMMENT ON COLUMN llm_cache.context_fingerprint IS 'Hash от chunk IDs для проверки идентичности контекста';
COMMENT ON COLUMN llm_cache.accessed_at IS 'Последнее время доступа для LRU eviction';
COMMENT ON COLUMN llm_cache.access_count IS 'Количество обращений к кэшу';
