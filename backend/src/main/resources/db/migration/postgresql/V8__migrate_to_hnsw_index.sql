-- Миграция на HNSW индекс для улучшения производительности векторного поиска
-- HNSW (Hierarchical Navigable Small World) обеспечивает лучшую производительность
-- и точность по сравнению с IVFFlat, особенно для больших датасетов

-- Удаляем старый IVFFlat индекс
DROP INDEX IF EXISTS document_chunks_embedding_ivfflat;

-- Создаем HNSW индекс
-- m=16: количество связей на слой (баланс между скоростью и точностью)
-- ef_construction=64: размер динамического списка кандидатов при построении
CREATE INDEX document_chunks_embedding_hnsw
    ON document_chunks USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);

-- Для оптимизации запросов можно настроить ef_search на уровне сессии:
-- SET hnsw.ef_search = 40;
-- Но мы оставляем дефолтное значение, которое можно настроить в application.properties
