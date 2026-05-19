ALTER TABLE users ADD COLUMN nickname VARCHAR(64);

CREATE UNIQUE INDEX idx_users_nickname
    ON users (LOWER(nickname))
    WHERE nickname IS NOT NULL;
