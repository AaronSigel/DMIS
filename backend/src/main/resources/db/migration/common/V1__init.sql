CREATE TABLE roles (
    name VARCHAR(32) PRIMARY KEY
);

CREATE TABLE users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL
);

CREATE TABLE user_roles (
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_name VARCHAR(32) NOT NULL REFERENCES roles(name) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_name)
);

CREATE TABLE documents (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    owner_id VARCHAR(64) NOT NULL REFERENCES users(id),
    storage_ref TEXT NOT NULL,
    extracted_text TEXT NOT NULL
);

CREATE TABLE document_versions (
    id VARCHAR(128) PRIMARY KEY,
    document_id VARCHAR(64) NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    version_id VARCHAR(32) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE ai_actions (
    id VARCHAR(64) PRIMARY KEY,
    intent VARCHAR(255) NOT NULL,
    entities_json TEXT NOT NULL,
    actor_id VARCHAR(64) NOT NULL REFERENCES users(id),
    status VARCHAR(32) NOT NULL,
    confirmed_by VARCHAR(64)
);

CREATE TABLE audit_log (
    id VARCHAR(64) PRIMARY KEY,
    at TIMESTAMP WITH TIME ZONE NOT NULL,
    actor_id VARCHAR(64) NOT NULL REFERENCES users(id),
    action VARCHAR(255) NOT NULL,
    resource_type VARCHAR(64) NOT NULL,
    resource_id VARCHAR(128) NOT NULL,
    details TEXT NOT NULL
);

CREATE TABLE mail_drafts (
    id VARCHAR(64) PRIMARY KEY,
    recipient VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    created_by VARCHAR(64) NOT NULL REFERENCES users(id)
);

CREATE TABLE calendar_drafts (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    attendees TEXT NOT NULL,
    start_iso VARCHAR(64) NOT NULL,
    end_iso VARCHAR(64) NOT NULL,
    created_by VARCHAR(64) NOT NULL REFERENCES users(id)
);

