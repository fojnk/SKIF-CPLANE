-- name: SelectAppAbout :one
SELECT * FROM t_app_about WHERE id = 1;

-- name: UpdateAppAbout :one
-- param: content *string
-- param: links *string
UPDATE t_app_about
SET
    content = CASE WHEN @content::text IS NOT NULL THEN @content::text ELSE content END,
    links = CASE WHEN @links::text IS NOT NULL THEN @links::text ELSE links END,
    updated_at = CURRENT_TIMESTAMP
WHERE id = 1 RETURNING *;

