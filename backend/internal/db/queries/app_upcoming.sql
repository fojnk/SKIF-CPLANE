-- name: SelectAppUpcoming :one
SELECT * FROM t_app_upcoming WHERE id = 1;

-- name: UpdateAppUpcoming :one
-- param: content string
UPDATE t_app_upcoming
SET
    content = @content::text,
    updated_at = CURRENT_TIMESTAMP
WHERE id = 1 RETURNING *;

