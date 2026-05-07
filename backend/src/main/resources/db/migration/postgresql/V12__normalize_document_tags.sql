CREATE TABLE document_tags (
    id BIGSERIAL PRIMARY KEY,
    document_id VARCHAR(64) NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    tag VARCHAR(128) NOT NULL,
    tag_norm VARCHAR(128) NOT NULL
);

CREATE UNIQUE INDEX document_tags_doc_norm_uq
    ON document_tags (document_id, tag_norm);

CREATE INDEX document_tags_tag_norm_idx
    ON document_tags (tag_norm);

INSERT INTO document_tags (document_id, tag, tag_norm)
SELECT d.id,
       split_tag.trimmed_tag,
       LOWER(split_tag.trimmed_tag)
FROM documents d
         CROSS JOIN LATERAL regexp_split_to_table(COALESCE(d.tags, ''), ',') raw_tag
         CROSS JOIN LATERAL (SELECT BTRIM(raw_tag) AS trimmed_tag) split_tag
WHERE split_tag.trimmed_tag <> ''
ON CONFLICT (document_id, tag_norm) DO NOTHING;

ALTER TABLE documents
    DROP COLUMN tags;
