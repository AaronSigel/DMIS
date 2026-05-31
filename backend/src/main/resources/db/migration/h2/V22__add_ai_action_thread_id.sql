ALTER TABLE ai_actions ADD COLUMN assistant_thread_id VARCHAR(64);

ALTER TABLE ai_actions
    ADD CONSTRAINT fk_ai_actions_assistant_thread
    FOREIGN KEY (assistant_thread_id) REFERENCES assistant_threads(id)
    ON DELETE SET NULL;

CREATE INDEX idx_ai_actions_assistant_thread_id ON ai_actions(assistant_thread_id);
