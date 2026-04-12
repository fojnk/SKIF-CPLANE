ALTER TABLE t_user
    ADD COLUMN IF NOT EXISTS email VARCHAR(255),
    ADD COLUMN IF NOT EXISTS display_name VARCHAR(255),
    ADD COLUMN IF NOT EXISTS password_hash TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_t_user_email_lower
    ON t_user (LOWER(email))
    WHERE email IS NOT NULL AND deleted = FALSE;

CREATE TABLE t_permission_request (
    id SERIAL PRIMARY KEY,
    requester_user_id INTEGER NOT NULL REFERENCES t_user (id) ON DELETE CASCADE,
    object_type VARCHAR(63) NOT NULL,
    object_id INTEGER NOT NULL,
    object_attribute VARCHAR(63) NOT NULL DEFAULT 'meta',
    action VARCHAR(5) NOT NULL,
    message TEXT NOT NULL DEFAULT '',
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    reviewer_user_id INTEGER REFERENCES t_user (id),
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT c_permission_request_status CHECK (status IN ('pending', 'approved', 'rejected'))
);

CREATE INDEX idx_permission_request_status ON t_permission_request (status);
CREATE INDEX idx_permission_request_requester ON t_permission_request (requester_user_id);

CREATE UNIQUE INDEX idx_permission_request_pending_unique
    ON t_permission_request (requester_user_id, object_type, object_id, object_attribute, action)
    WHERE status = 'pending';
