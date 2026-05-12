-- H2 не поддерживает materialized views, поэтому создаем обычное view
CREATE VIEW user_accessible_chunks AS
SELECT
    dc.id AS chunk_id,
    dc.document_id,
    dc.chunk_index,
    dc.chunk_text,
    dc.created_at,
    d.owner_id,
    d.title AS document_title
FROM document_chunks dc
JOIN documents d ON d.id = dc.document_id;
