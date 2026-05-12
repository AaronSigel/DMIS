CREATE TABLE mail_draft_attachments (
    draft_id VARCHAR(64) NOT NULL REFERENCES mail_drafts(id) ON DELETE CASCADE,
    document_id VARCHAR(64) NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    PRIMARY KEY (draft_id, document_id)
);
