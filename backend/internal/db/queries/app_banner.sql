-- name: SelectAppBanners :many
SELECT * FROM t_app_banner ORDER BY created_at DESC;

-- name: IsExistsActiveBlockBanners :one
SELECT COUNT(*) > 0 FROM t_app_banner
WHERE active = true AND type = 'release_block'
  AND (starts IS NULL OR starts <= NOW())
  AND (ends IS NULL OR ends >= NOW());

-- name: SelectAppBanner :one
SELECT * FROM t_app_banner WHERE id = $1;

-- name: UpdateAppBanner :one
UPDATE t_app_banner
SET
    title = CASE WHEN @title::text != '' THEN @title::text ELSE title END,
    message = CASE WHEN @message::text != '' THEN @message::text ELSE message END,
    active = CASE WHEN @active::bool IS NOT NULL THEN @active ELSE active END,
    color = CASE WHEN @color::text != '' THEN @color::text ELSE color END,
    color_dark = CASE WHEN @color_dark::text != '' THEN @color_dark::text ELSE color_dark END,
    type = COALESCE(sqlc.narg('type'), type),
    starts = COALESCE(sqlc.narg('starts'), starts),
    ends = COALESCE(sqlc.narg('ends'), ends),
    updated_at = NOW()
WHERE id = $1 RETURNING *;

-- name: DeleteAppBanner :exec
DELETE FROM t_app_banner WHERE id = $1;

-- name: InsertAppBanner :one
INSERT INTO t_app_banner (title, message, active, color, color_dark, type, starts, ends)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id;

-- name: SelectActiveAppBanner :one
SELECT * FROM t_app_banner
WHERE active = true
  AND (starts IS NULL OR starts <= NOW())
  AND (ends IS NULL OR ends >= NOW())
ORDER BY updated_at DESC LIMIT 1;

-- name: SelectCurrentAppBanner :one
SELECT * FROM t_app_banner 
WHERE active = true 
  AND (starts IS NULL OR starts <= NOW())
  AND (ends IS NULL OR ends >= NOW())
ORDER BY updated_at DESC 
LIMIT 1;

-- name: DeactivateAllBannersExcept :exec
UPDATE t_app_banner SET active = false WHERE id != $1;