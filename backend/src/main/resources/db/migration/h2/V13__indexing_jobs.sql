CREATE TABLE indexing_jobs (
    job_id VARCHAR(64) PRIMARY KEY,
    document_id VARCHAR(64) NOT NULL,
    status VARCHAR(16) NOT NULL,
    attempts INT NOT NULL DEFAULT 0,
    last_error TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE,
    finished_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT indexing_jobs_document_fk FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
);

CREATE INDEX idx_indexing_jobs_status_created
    ON indexing_jobs (status, created_at);

CREATE INDEX idx_indexing_jobs_document_id
    ON indexing_jobs (document_id);
