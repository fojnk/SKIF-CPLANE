
-- name: InsertRobotToken :one
INSERT INTO robot_tokens (robot_id, token, expires_at)
VALUES ($1, $2, $3)
RETURNING *;

-- name: SelectRobotTokens :many
SELECT * FROM robot_tokens WHERE robot_id = $1;

-- name: SelectRobotToken :one
SELECT * FROM robot_tokens WHERE id = $1;

-- name: DeleteRobotToken :exec
DELETE FROM robot_tokens WHERE id = $1;

-- name: DeleteAllRobotTokens :exec
DELETE FROM robot_tokens WHERE robot_id = $1;

-- name: CheckRobotToken :exec
SELECT EXISTS (
    SELECT 1
    FROM robot_tokens
    WHERE token = $1
      AND (expires_at IS NULL OR expires_at > NOW())
);