-- name: InsertProjectVariable :one
INSERT INTO t_project_variable (project_id, name, value, type) VALUES ($1, $2, $3, $4) RETURNING id;

-- name: UpdateProjectVariable :exec
UPDATE t_project_variable SET
name = CASE WHEN @name::text != '' THEN @name::text ELSE name END,
value = CASE WHEN @value::text != '' THEN @value::text ELSE value END,
type = CASE WHEN @type::text != '' THEN @type::text ELSE type END
WHERE id = $1;

-- name: DeleteProjectVariable :exec
DELETE FROM t_project_variable WHERE id = $1;

-- name: SelectProjectVariables :many
SELECT id, name, type FROM t_project_variable WHERE project_id = $1;

-- name: SelectProjectVariable :one
SELECT id, name, value, type, project_id FROM t_project_variable WHERE id = $1;

-- name: InsertNamespaceVariable :one
INSERT INTO t_namespace_variable (namespace_id, name, value, type) VALUES ($1, $2, $3, $4) RETURNING id;

-- name: UpdateNamespaceVariable :exec
UPDATE t_namespace_variable SET
name = CASE WHEN @name::text != '' THEN @name::text ELSE name END,
value = CASE WHEN @value::text != '' THEN @value::text ELSE value END,
type = CASE WHEN @type::text != '' THEN @type::text ELSE type END
WHERE id = $1;

-- name: DeleteNamespaceVariable :exec
DELETE FROM t_namespace_variable WHERE id = $1;

-- name: SelectNamespaceVariables :many
SELECT id, name, type FROM t_namespace_variable WHERE namespace_id = $1;

-- name: SelectNamespaceVariable :one
SELECT id, name, value, namespace_id, type FROM t_namespace_variable WHERE id = $1;
