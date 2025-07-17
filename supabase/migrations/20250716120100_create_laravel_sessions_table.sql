-- Create sessions table in laravel schema for Laravel Sanctum session-based authentication

CREATE TABLE IF NOT EXISTS laravel.sessions (
    id VARCHAR(255) PRIMARY KEY,
    user_id BIGINT NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    payload TEXT NOT NULL,
    last_activity INTEGER NOT NULL
);

CREATE INDEX sessions_user_id_index ON laravel.sessions (user_id);
CREATE INDEX sessions_last_activity_index ON laravel.sessions (last_activity);

-- Grant permissions for Laravel to manage sessions
GRANT SELECT, INSERT, UPDATE, DELETE ON laravel.sessions TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON laravel.sessions TO postgres;