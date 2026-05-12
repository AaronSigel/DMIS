-- Расширение событий календаря, участники и вложения-документы (MVP).
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS creation_source VARCHAR(32) NOT NULL DEFAULT 'UI';
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS source_mail_message_id VARCHAR(512);

CREATE TABLE calendar_event_participants (
    id VARCHAR(64) PRIMARY KEY,
    event_id VARCHAR(64) NOT NULL,
    user_id VARCHAR(64) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    UNIQUE (event_id, user_id),
    CONSTRAINT fk_calendar_event_participants_event FOREIGN KEY (event_id) REFERENCES calendar_events(id) ON DELETE CASCADE,
    CONSTRAINT fk_calendar_event_participants_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_calendar_event_participants_event ON calendar_event_participants(event_id);
CREATE INDEX idx_calendar_event_participants_user ON calendar_event_participants(user_id);

CREATE TABLE calendar_event_attachments (
    id VARCHAR(64) PRIMARY KEY,
    event_id VARCHAR(64) NOT NULL,
    document_id VARCHAR(64) NOT NULL,
    role VARCHAR(32) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    UNIQUE (event_id, document_id, role),
    CONSTRAINT fk_calendar_event_attachments_event FOREIGN KEY (event_id) REFERENCES calendar_events(id) ON DELETE CASCADE,
    CONSTRAINT fk_calendar_event_attachments_document FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
);

CREATE INDEX idx_calendar_event_attachments_event ON calendar_event_attachments(event_id);
