-- Материализованное представление для оптимизации ACL-фильтрации в гибридном поиске
-- Денормализует owner_id из documents в document_chunks для быстрой фильтрации

CREATE MATERIALIZED VIEW user_accessible_chunks AS
SELECT
    dc.id AS chunk_id,
    dc.document_id,
    dc.chunk_index,
    dc.chunk_text,
    dc.chunk_tsv,
    dc.embedding,
    dc.created_at,
    d.owner_id,
    d.title AS document_title
FROM document_chunks dc
JOIN documents d ON d.id = dc.document_id;

-- Индексы для быстрого поиска
CREATE INDEX user_accessible_chunks_owner_id_idx ON user_accessible_chunks (owner_id);

CREATE INDEX user_accessible_chunks_tsv_gin
    ON user_accessible_chunks USING gin (chunk_tsv);

CREATE INDEX user_accessible_chunks_embedding_hnsw
    ON user_accessible_chunks USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);

-- Уникальный индекс для CONCURRENTLY refresh
CREATE UNIQUE INDEX user_accessible_chunks_chunk_id_idx ON user_accessible_chunks (chunk_id);

-- Комментарии
COMMENT ON MATERIALIZED VIEW user_accessible_chunks IS 'Денормализованное представление chunks с owner_id для оптимизации ACL-фильтрации';

-- Функция для автоматического обновления materialized view
CREATE OR REPLACE FUNCTION refresh_user_accessible_chunks()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY user_accessible_chunks;
END;
$$ LANGUAGE plpgsql;

-- Триггер для обновления при изменении документов (опционально, можно использовать scheduled refresh)
-- Для production лучше использовать pg_cron или внешний scheduler
