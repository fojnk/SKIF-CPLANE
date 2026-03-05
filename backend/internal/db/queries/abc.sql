-- name: GetABCGroupRange :many
SELECT id, name FROM t_user_group
WHERE name LIKE 'abc_%'
OFFSET $1 LIMIT $2;

-- name: DeleteBatchUsersFromGroup :batchexec
DELETE FROM t_user_group_match 
WHERE user_id = $1 AND user_group_id = $2;

-- name: InsertBatchUsersToGroup :batchexec
INSERT INTO t_user_group_match (user_id, user_group_id) VALUES ($1, $2) ON CONFLICT DO NOTHING;

-- name: InsertNewUsers :batchone
WITH ins AS (
        INSERT INTO t_user(name) VALUES($1) ON CONFLICT DO NOTHING RETURNING id
)
SELECT id FROM ins
UNION ALL
SELECT id FROM t_user WHERE name = $1;

-- name: SelectUsersByGroupID :many
SELECT t_user.* FROM t_user
JOIN t_user_group_match ON t_user.id = t_user_group_match.user_id
WHERE t_user_group_match.user_group_id = $1;
