-- name: SelectAppAbout :one
SELECT * FROM t_app_about WHERE id = 1;

-- name: UpdateAppAbout :one
UPDATE t_app_about
SET
    content = COALESCE(sqlc.narg('content'), content),
    links = COALESCE(sqlc.narg('links'), links),
    updated_at = CURRENT_TIMESTAMP
WHERE id = 1 RETURNING *;

