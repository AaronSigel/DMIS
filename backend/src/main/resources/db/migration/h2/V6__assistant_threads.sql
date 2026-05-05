CREATE TABLE assistant_threads (
    id VARCHAR(64) PRIMARY KEY,
    owner_id VARCHAR(64) NOT NULL,
    title VARCHAR(255) NOT NULL,
    ideology_profile_id VARCHAR(64) DEFAULT 'balanced' NOT NULL,
    knowledge_source_ids TEXT DEFAULT 'documents' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_assistant_threads_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE assistant_messages (
    id VARCHAR(64) PRIMARY KEY,
    thread_id VARCHAR(64) NOT NULL,
    role VARCHAR(32) NOT NULL,
    content TEXT NOT NULL,
    document_ids TEXT DEFAULT '' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_assistant_messages_thread FOREIGN KEY (thread_id) REFERENCES assistant_threads(id) ON DELETE CASCADE
);

CREATE TABLE assistant_thread_documents (
    id VARCHAR(64) PRIMARY KEY,
    thread_id VARCHAR(64) NOT NULL,
    document_id VARCHAR(64) NOT NULL,
    CONSTRAINT fk_assistant_thread_documents_thread FOREIGN KEY (thread_id) REFERENCES assistant_threads(id) ON DELETE CASCADE,
    CONSTRAINT fk_assistant_thread_documents_document FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    CONSTRAINT uq_assistant_thread_document UNIQUE (thread_id, document_id)
);

CREATE TABLE assistant_preferences (
    owner_id VARCHAR(64) PRIMARY KEY,
    ideology_profile_id VARCHAR(64) DEFAULT 'balanced' NOT NULL,
    knowledge_source_ids TEXT DEFAULT 'documents' NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_assistant_preferences_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);
