DROP INDEX IF EXISTS idx_permission_request_pending_unique;
DROP INDEX IF EXISTS idx_permission_request_requester;
DROP INDEX IF EXISTS idx_permission_request_status;
DROP TABLE IF EXISTS t_permission_request;
DROP INDEX IF EXISTS idx_t_user_email_lower;
ALTER TABLE t_user
    DROP COLUMN IF EXISTS password_hash,
    DROP COLUMN IF EXISTS display_name,
    DROP COLUMN IF EXISTS email;
