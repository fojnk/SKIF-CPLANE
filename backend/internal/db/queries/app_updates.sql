-- name: SelectAppUpdates :many
SELECT * FROM t_app_updates ORDER BY release_date DESC;

-- name: SelectAppUpdatesPublished :many
SELECT * FROM t_app_updates WHERE is_published = true ORDER BY release_date DESC;

-- name: SelectAppUpdatesUpcoming :many
SELECT * FROM t_app_updates WHERE is_published = false ORDER BY release_date ASC;

-- name: SelectAppUpdate :one
SELECT * FROM t_app_updates WHERE id = $1;

-- name: InsertAppUpdate :one
INSERT INTO t_app_updates (title, description, content, video_url, image_url, release_date, is_published)
VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;

-- name: UpdateAppUpdate :one
-- param: title string
-- param: description string
-- param: content string
-- param: video_url *string
-- param: image_url *string
-- param: release_date *time.Time
-- param: is_published *bool
UPDATE t_app_updates
SET
    title = CASE WHEN @title::text != '' THEN @title::text ELSE title END,
    description = CASE WHEN @description::text != '' THEN @description::text ELSE description END,
    content = CASE WHEN @content::text != '' THEN @content::text ELSE content END,
    video_url = CASE WHEN @video_url::text IS NOT NULL THEN @video_url ELSE video_url END,
    image_url = CASE WHEN @image_url::text IS NOT NULL THEN @image_url ELSE image_url END,
    release_date = CASE WHEN @release_date::timestamp IS NOT NULL THEN @release_date ELSE release_date END,
    is_published = CASE WHEN @is_published::bool IS NOT NULL THEN @is_published ELSE is_published END,
    updated_at = CURRENT_TIMESTAMP
WHERE id = $1 RETURNING *;

-- name: DeleteAppUpdate :exec
DELETE FROM t_app_updates WHERE id = $1;

-- name: SelectAppUpdatesByDateRange :many
SELECT * FROM t_app_updates 
WHERE release_date >= $1 AND release_date <= $2 
ORDER BY release_date DESC;

-- name: SelectAppUpdatesPaginated :many
-- Для админов: сначала все is_published=false, потом по release_date DESC
-- Для пользователей: только is_published=true, по release_date DESC
SELECT * FROM t_app_updates 
WHERE CASE 
    WHEN $1::bool = true THEN true  -- админ видит все
    ELSE is_published = true         -- пользователь видит только опубликованные
END
ORDER BY 
    CASE WHEN $1::bool = true THEN 
        CASE WHEN is_published = false THEN 0 ELSE 1 END
    ELSE 1 END,
    release_date DESC
LIMIT $2 OFFSET $3;

-- name: CountAppUpdatesPaginated :one
SELECT COUNT(*) FROM t_app_updates 
WHERE CASE 
    WHEN $1::bool = true THEN true  -- админ видит все
    ELSE is_published = true         -- пользователь видит только опубликованные
END;

