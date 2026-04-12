-- name: InsertPermissionRequest :one
INSERT INTO t_permission_request (
    requester_user_id,
    object_type,
    object_id,
    object_attribute,
    action,
    message
) VALUES ($1, $2, $3, $4, $5, $6)
RETURNING *;

-- name: ListMyPermissionRequests :many
SELECT *
FROM t_permission_request
WHERE requester_user_id = $1
ORDER BY created_at DESC;

-- name: ListPermissionRequestsForAdmin :many
SELECT
    pr.id,
    pr.requester_user_id,
    pr.object_type,
    pr.object_id,
    pr.object_attribute,
    pr.action,
    pr.message,
    pr.status,
    pr.reviewer_user_id,
    pr.reviewed_at,
    pr.created_at,
    rq.name AS requester_name,
    rq.email AS requester_email
FROM t_permission_request pr
JOIN t_user rq ON rq.id = pr.requester_user_id
WHERE (sqlc.narg('status_filter')::varchar IS NULL OR pr.status = sqlc.narg('status_filter')::varchar)
ORDER BY pr.created_at DESC
LIMIT $1 OFFSET $2;

-- name: CountPermissionRequestsForAdmin :one
SELECT COUNT(*)
FROM t_permission_request pr
WHERE (sqlc.narg('status_filter')::varchar IS NULL OR pr.status = sqlc.narg('status_filter')::varchar);

-- name: GetPermissionRequestByID :one
SELECT *
FROM t_permission_request
WHERE id = $1;

-- name: UpdatePermissionRequestReviewed :one
UPDATE t_permission_request
SET
    status = $2,
    reviewer_user_id = $3,
    reviewed_at = CURRENT_TIMESTAMP
WHERE id = $1 AND status = 'pending'
RETURNING id;
