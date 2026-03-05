-- name: AddUserToGroup :exec
INSERT INTO t_user_group_match(user_id, user_group_id) VALUES ($1, $2);

-- name: RemoveUserFromGroup :exec
DELETE FROM t_user_group_match WHERE user_id = $1 AND user_group_id = $2;

-- name: AddRuleToRole :exec
INSERT INTO t_role_match(rule_id, role_id) VALUES ($1, $2);

-- name: RemoveRuleFromRole :exec
DELETE FROM t_role_match WHERE rule_id = $1 AND role_id = $2;

-- name: GrantUserRule :exec
INSERT INTO t_acl_match(user_id, rule_id) VALUES ($1, $2);

-- name: DisclaimUserRule :exec
DELETE FROM t_acl_match WHERE user_id = $1 AND rule_id = $2;

-- name: GrantUserRole :exec
INSERT INTO t_acl_match(user_id, role_id) VALUES ($1, $2);

-- name: DisclaimUserRole :exec
DELETE FROM t_acl_match WHERE user_id = $1 AND role_id = $2;

-- name: GrantUserGroupRule :exec
INSERT INTO t_acl_match(user_group_id, rule_id) VALUES ($1, $2);

-- name: DisclaimUserGroupRule :exec
DELETE FROM t_acl_match WHERE user_group_id = $1 AND rule_id = $2;

-- name: GrantUserGroupRole :exec
INSERT INTO t_acl_match(user_group_id, role_id) VALUES ($1, $2);

-- name: DisclaimUserGroupRole :exec
DELETE FROM t_acl_match WHERE user_group_id = $1 AND role_id = $2;

-- name: SelectUserGrants :many
SELECT t_rule.action, t_rule.object_type, t_rule.object_attribute, t_rule.object_id FROM t_user_rule
JOIN t_rule ON t_user_rule.rule_id = t_rule.id
JOIN t_user ON t_user.id = t_user_rule.user_id
WHERE t_user.deleted = FALSE AND t_user_rule.user_id = $1 AND (t_rule.object_id = $2 OR t_rule.object_id = 0) AND t_rule.object_type = $3 AND $4 ~ t_rule.object_attribute;

-- name: CheckUserHasRight :one
SELECT COUNT(*) FROM t_user_rule
JOIN t_rule ON t_user_rule.rule_id = t_rule.id
JOIN t_user ON t_user.id = t_user_rule.user_id
WHERE t_user.deleted = FALSE AND t_user_rule.user_id = $1 AND (t_rule.object_id = $2 OR t_rule.object_id = 0) AND t_rule.object_type = $3 AND $4 ~ t_rule.object_attribute AND $5 <= t_rule.action;


-- name: GetUsersThatHasRights :many
SELECT
    t_user_rule.user_id,
    t_user.name,
    COUNT(DISTINCT t_rule.action) AS unique_action_count
FROM t_user_rule
         JOIN t_rule ON t_user_rule.rule_id = t_rule.id
        LEFT JOIN t_user ON t_user_rule.user_id = t_user.id
WHERE
    t_user.deleted = FALSE AND
    (t_rule.object_id = $1 OR t_rule.object_id = 0)
  AND (
    ( @search::text IS NULL OR t_user.name ILIKE '%' || @search || '%' ) OR
    ( t_user.id::TEXT    ILIKE '%' || @search    || '%'   )
    )
  AND t_rule.object_type = $2
  AND $3 ~ t_rule.object_attribute
  AND $4 <= t_rule.action
GROUP BY t_user_rule.user_id, t_user.name;


-- name: GetRoleOwners :many
SELECT tu.* from t_role_owner tr
JOIN t_user tu ON tu.id = tr.user_id
WHERE t_user.deleted = FALSE AND tr.role_id = $1;

-- name: InsertRoleOwner :one
INSERT INTO t_role_owner (role_id, user_id)
VALUES ($1, $2) ON CONFLICT (role_id, user_id) DO NOTHING RETURNING *;

-- name: InsertRoleObjectMatch :one
INSERT INTO t_role_object_match (role_id, role_type, object_type, object_id)
VALUES ($1, $2, $3, $4) RETURNING *;

-- name: GetRoleObjectMatchById :one
SELECT *
FROM t_role_object_match
WHERE id = $1;

-- name: GetRoleMatches :many
SELECT *
FROM t_role_object_match
WHERE role_id = $1;

-- name: GetRolesByObject :many
SELECT *
FROM t_role_object_match
WHERE object_type = $1
  AND object_id = $2;

-- name: GetRolesByObjectAndType :one
SELECT *
FROM t_role_object_match
WHERE object_type = $1
  AND object_id = $2
 AND role_type = $3;

-- name: UpdateRoleMatch :one
UPDATE t_role_object_match
SET role_id = $1,
    role_type = $2,
    object_type = $3,
    object_id = $4
WHERE id = $5 RETURNING *;

-- name: DeleteRoleMatchById :exec
DELETE FROM t_role_object_match
WHERE id = $1;

-- name: DeleteAllObjectMatches :exec
DELETE FROM t_role_object_match
WHERE object_type = $1
  AND object_id = $2;

-- name: GetProjectsWithoutRole :many
SELECT pr.* FROM t_project pr
LEFT JOIN t_role_object_match rm ON rm.object_id = pr.id AND rm.object_type = 'project'
WHERE rm.object_id IS NULL AND pr.deleted=false;

-- name: GetNamespacesWithoutRole :many
SELECT ns.* FROM t_namespace ns
LEFT JOIN t_role_object_match rm ON rm.object_id = ns.id AND rm.object_type = 'namespace'
WHERE rm.object_id IS NULL AND ns.deleted=false;
