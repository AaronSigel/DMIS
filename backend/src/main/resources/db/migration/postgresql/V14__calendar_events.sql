CREATE TABLE calendar_events (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    attendees TEXT NOT NULL,
    start_iso VARCHAR(64) NOT NULL,
    end_iso VARCHAR(64) NOT NULL,
    created_by VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX idx_calendar_events_created_by_start
    ON calendar_events (created_by, start_iso);
