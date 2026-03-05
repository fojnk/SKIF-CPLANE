-- name: SelectProjectConfigVersions :many
SELECT id, version_id, config, created_at FROM t_project_config_v
WHERE project_id = $1
ORDER BY created_at DESC;

-- name: SelectCurrentProjectConfig :one
SELECT pcv.id, pcv.version_id, pcv.config, pcv.created_at FROM v_real_project p
JOIN t_project_config_v pcv ON pcv.id = p.project_version_id
WHERE p.id = $1;

-- name: SelectProjectABCProductID :one
SELECT p.id, COALESCE(jsonb_extract_path_text(safe_jsonb_parse(pcv.config::text), 'AbcProductId'), '')::text as abc FROM v_real_project p
JOIN t_project_config_v pcv ON pcv.id = p.project_version_id
WHERE p.id = $1;

-- name: InsertProjectConfig :one
INSERT INTO t_project_config_v(project_id, version_id, config)
    SELECT $1, COALESCE(MAX(version_id), 0) + 1, $2 FROM t_project_config_v WHERE project_id = $1
RETURNING id;

-- name: UpdateCurrentProjectConfig :exec
UPDATE t_project p
SET project_version_id = $2
WHERE p.id = $1;

-- name: SelectProjectConfig :one
SELECT id, version_id, config, created_at FROM t_project_config_v
WHERE id = $1;

-- name: DeleteProjectConfig :exec
DELETE FROM t_project_config_v
WHERE id = $1;

-- name: SelectNamespaceConfigVersions :many
SELECT id, version_id, config, created_at FROM t_namespace_config_v
WHERE namespace_id = $1
ORDER BY created_at DESC;

-- name: SelectCurrentNamespaceConfig :one
SELECT nc.id, nc.version_id, nc.config, nc.created_at FROM v_real_namespace n
JOIN t_namespace_config_v nc ON nc.id = n.namespace_version_id
WHERE n.id = $1;

-- name: UpdateCurrentNamespaceConfig :exec
UPDATE t_namespace n
SET namespace_version_id = $2
WHERE n.id = $1;

-- name: InsertNamespaceConfig :one
INSERT INTO t_namespace_config_v(namespace_id, version_id, config)
    SELECT $1, COALESCE(MAX(version_id), 0) + 1, $2 FROM t_namespace_config_v WHERE namespace_id = $1
RETURNING id;

-- name: SelectNamespaceConfig :one
SELECT id, version_id, config, created_at FROM t_namespace_config_v
WHERE id = $1;

-- name: DeleteNamespaceConfig :exec
DELETE FROM t_namespace_config_v
WHERE id = $1;
