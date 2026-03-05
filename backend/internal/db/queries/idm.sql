-- name: DeleteBatchUsersFromRole :batchexec
DELETE FROM t_acl_match
WHERE user_id = $1 AND role_id = $2;

-- name: AddRoleToBatchUsers :batchexec
INSERT INTO t_acl_match (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING;

-- name: SelectUsersByRoleID :many
SELECT t_user.* FROM t_user
JOIN t_acl_match ON t_user.id = t_acl_match.user_id
WHERE t_acl_match.role_id = $1;

-- name: SelectRoleByIdmId :one
SELECT tr.* FROM t_role tr
WHERE tr.idm_id = $1;

-- name: DeleteUserRoles :exec
DELETE FROM t_acl_match
WHERE user_id = $1
  AND role_id IN (
    SELECT r.id
    FROM t_role r
    WHERE r.idm_id NOT IN (SELECT unnest(@roles::text[]))
);

-- name: DeleteUserRulesForDeletedRoles :exec
DELETE FROM t_user_rule
WHERE rule_id IN (
    SELECT rm.rule_id
    FROM t_role_match rm
    WHERE rm.role_id IN (
        SELECT r.id
        FROM t_role r
        WHERE r.idm_id NOT IN (SELECT unnest(@roles::text[]))
      )
  ) AND user_id = $1;

-- name: CreateUserRoles :exec
INSERT INTO t_acl_match (user_id, role_id)
SELECT $1, r.id
FROM t_role r
WHERE r.idm_id IN (SELECT unnest(@roles::text[]))
  AND NOT EXISTS (
    SELECT 1 FROM t_acl_match am
    WHERE am.user_id = $1 AND am.role_id = r.id
);

-- name: DeleteUsersByLastSync :many
UPDATE t_user SET deleted=TRUE WHERE now() - last_sync > interval '1 second' * @deletion_interval AND is_robot=FALSE RETURNING *;

-- name: UpdateUserSync :exec
UPDATE t_user SET last_sync = now() WHERE name = $1;
