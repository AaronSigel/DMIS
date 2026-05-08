CREATE TABLE mail_accounts (
    owner_id VARCHAR(64) PRIMARY KEY,
    imap_host VARCHAR(255) NOT NULL,
    imap_port INTEGER NOT NULL,
    imap_username VARCHAR(255) NOT NULL,
    encrypted_password TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT mail_accounts_owner_fk FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_mail_accounts_imap_username
    ON mail_accounts (imap_username);

