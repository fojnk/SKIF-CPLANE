-- name: InsertUser :one
WITH ins AS (
        INSERT INTO t_user(name) VALUES($1) ON CONFLICT DO NOTHING RETURNING id
)
SELECT id FROM ins
UNION ALL
SELECT id FROM t_user WHERE name = $1;

-- name: InsertRobot :one
WITH ins AS (
INSERT INTO t_user(name, is_robot) VALUES($1, TRUE)
ON CONFLICT DO NOTHING
    RETURNING id
    )
SELECT id FROM ins
UNION ALL
SELECT id FROM t_user WHERE name = $1;

-- name: InsertUserGroup :one
INSERT INTO t_user_group(name) VALUES($1) RETURNING id;

-- name: SelectUserGroup :many
SELECT u.id, u.name FROM t_user u
LEFT JOIN t_user_group_match m ON u.id = m.user_id
WHERE m.user_group_id = $1;

-- name: UpdateUserGroup :exec
UPDATE t_user_group SET name = $2 WHERE id = $1;

-- name: InsertRule :one
INSERT INTO t_rule(object_type, object_attribute, object_id, action) VALUES ($1, $2, $3, $4) RETURNING id;

-- name: InsertRole :one
INSERT INTO t_role(name, description, idm_id) VALUES ($1, $2, $3) RETURNING *;

-- name: SelectRole :many
SELECT rule.id, rule.object_id, rule.object_type, rule.object_attribute, rule.action FROM t_rule rule
LEFT JOIN t_role_match rm ON rule.id = rm.rule_id
WHERE role_id = $1;

-- name: UpdateRole :exec
UPDATE t_role SET name = $2, description = $3 WHERE id = $1;

-- name: UpdateRoleForIdm :one
UPDATE t_role SET name = $2, description = $3 WHERE id = $1 RETURNING *;

-- name: GetUserByName :one
SELECT id FROM t_user WHERE name = $1;

-- name: GetUserById :one
SELECT * FROM t_user WHERE id = $1;

-- name: GetUserInfoByName :one
SELECT * FROM t_user WHERE name = $1;

-- name: SelectUserGroups :many
SELECT id, name FROM t_user_group;

-- name: SelectRoles :many
SELECT * FROM t_role;

-- name: SelectUserRoles :many
SELECT t_role.* FROM t_acl_match
JOIN t_role on t_acl_match.role_id = t_role.id WHERE t_acl_match.user_id = $1;

-- name: SelectACLMatchesForUserGroup :many
SELECT t_acl_match.role_id as role_id, t_acl_match.rule_id as rule_id, t_role.name as role_name, t_rule.object_type as rule_object_type, t_rule.object_attribute as rule_object_attribute, t_rule.object_id as rule_object_id, t_rule.action as rule_action FROM t_acl_match
LEFT JOIN t_role ON t_acl_match.role_id = t_role.id
LEFT JOIN t_role_match ON t_acl_match.role_id = t_role_match.role_id
LEFT JOIN t_rule ON t_role_match.rule_id = t_rule.id
WHERE t_acl_match.user_group_id = $1 AND t_acl_match.rule_id IS NULL
UNION ALL
SELECT NULL as role_id, t_acl_match.rule_id as rule_id, NULL as role_name, t_rule.object_type as rule_object_type, t_rule.object_attribute as rule_object_attribute, t_rule.object_id as rule_object_id, t_rule.action as rule_action FROM t_acl_match
LEFT JOIN t_rule ON t_acl_match.rule_id = t_rule.id
WHERE t_acl_match.user_group_id = $1 AND t_acl_match.role_id IS NULL;

-- name: SelectACLMatchesForUser :many
WITH user_groups AS (
        SELECT user_group_id FROM t_user_group_match WHERE t_user_group_match.user_id = $1
)
SELECT t_acl_match.role_id as role_id, t_acl_match.rule_id as rule_id, t_role.name as role_name, t_rule.object_type as rule_object_type, t_rule.object_attribute as rule_object_attribute, t_rule.object_id as rule_object_id, t_rule.action as rule_action FROM t_acl_match
LEFT JOIN t_role ON t_acl_match.role_id = t_role.id
LEFT JOIN t_role_match ON t_acl_match.role_id = t_role_match.role_id
LEFT JOIN t_rule ON t_role_match.rule_id = t_rule.id
WHERE t_acl_match.user_id = $1 AND t_acl_match.rule_id IS NULL
UNION ALL
SELECT NULL as role_id, t_acl_match.rule_id as rule_id, NULL as role_name, t_rule.object_type as rule_object_type, t_rule.object_attribute as rule_object_attribute, t_rule.object_id as rule_object_id, t_rule.action as rule_action FROM t_acl_match
LEFT JOIN t_rule ON t_acl_match.rule_id = t_rule.id
WHERE t_acl_match.user_id = $1 AND t_acl_match.role_id IS NULL
UNION ALL
SELECT t_acl_match.role_id as role_id, t_acl_match.rule_id as rule_id, t_role.name as role_name, t_rule.object_type as rule_object_type, t_rule.object_attribute as rule_object_attribute, t_rule.object_id as rule_object_id, t_rule.action as rule_action FROM t_acl_match
LEFT JOIN t_role ON t_acl_match.role_id = t_role.id
LEFT JOIN t_role_match ON t_acl_match.role_id = t_role_match.role_id
LEFT JOIN t_rule ON t_role_match.rule_id = t_rule.id
WHERE t_acl_match.user_group_id IN (SELECT user_group_id FROM user_groups) AND t_acl_match.rule_id IS NULL
UNION ALL
SELECT NULL as role_id, t_acl_match.rule_id as rule_id, NULL as role_name, t_rule.object_type as rule_object_type, t_rule.object_attribute as rule_object_attribute, t_rule.object_id as rule_object_id, t_rule.action as rule_action FROM t_acl_match
LEFT JOIN t_rule ON t_acl_match.rule_id = t_rule.id
WHERE t_acl_match.user_group_id IN (SELECT user_group_id FROM user_groups) AND t_acl_match.role_id IS NULL;
