-- name: InsertPinnedProject :one
INSERT INTO t_user_pinned_projects (user_id, project_id)
VALUES ($1, $2)
ON CONFLICT (user_id, project_id) DO NOTHING
RETURNING *;

-- name: DeletePinnedProject :exec
DELETE FROM t_user_pinned_projects
WHERE user_id = $1 AND project_id = $2;

-- name: GetUserPinnedProjects :many
SELECT t_user_pinned_projects.id, project_id, pr.name as project_name, pinned_at
FROM t_user_pinned_projects
JOIN t_project pr ON pr.id = t_user_pinned_projects.project_id
WHERE user_id = $1 AND pr.deleted = FALSE
ORDER BY pinned_at DESC;
