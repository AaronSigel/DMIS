CREATE TABLE assistant_threads (
    id VARCHAR(64) PRIMARY KEY,
    owner_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    ideology_profile_id VARCHAR(64) NOT NULL DEFAULT 'balanced',
    knowledge_source_ids TEXT NOT NULL DEFAULT 'documents',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE assistant_messages (
    id VARCHAR(64) PRIMARY KEY,
    thread_id VARCHAR(64) NOT NULL REFERENCES assistant_threads(id) ON DELETE CASCADE,
    role VARCHAR(32) NOT NULL,
    content TEXT NOT NULL,
    document_ids TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE assistant_thread_documents (
    id VARCHAR(64) PRIMARY KEY,
    thread_id VARCHAR(64) NOT NULL REFERENCES assistant_threads(id) ON DELETE CASCADE,
    document_id VARCHAR(64) NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    UNIQUE (thread_id, document_id)
);

CREATE TABLE assistant_preferences (
    owner_id VARCHAR(64) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    ideology_profile_id VARCHAR(64) NOT NULL DEFAULT 'balanced',
    knowledge_source_ids TEXT NOT NULL DEFAULT 'documents',
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
