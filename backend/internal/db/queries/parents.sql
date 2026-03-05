-- name: GetExperimentNamespace :one
SELECT t_namespace.id, t_namespace.name FROM t_namespace
JOIN t_project ON t_project.namespace_id = t_namespace.id
JOIN t_experiment ON t_experiment.project_id = t_project.id
WHERE t_experiment.id = $1 AND t_namespace.deleted = FALSE AND t_project.deleted = FALSE;

-- name: GetProjectNamespace :one
SELECT t_namespace.id, t_namespace.name FROM t_namespace
JOIN t_project ON t_project.namespace_id = t_namespace.id
WHERE t_project.id = $1 AND t_namespace.deleted = FALSE AND t_project.deleted = FALSE;

-- name: GetDatasetNamespace :one
SELECT t_namespace.id, t_namespace.name FROM t_namespace
JOIN t_dataset ON t_dataset.namespace_id = t_namespace.id
WHERE t_dataset.id = $1 AND t_namespace.deleted = FALSE AND t_dataset.deleted = FALSE;

-- name: GetDatasetProject :one
SELECT t_project.id, t_project.name FROM t_project
                                                 JOIN t_dataset ON t_dataset.project_id = t_project.id
WHERE t_dataset.id = $1 AND t_project.deleted = FALSE AND t_dataset.deleted = FALSE;

-- name: GetExperimentProject :one
SELECT t_project.id FROM t_project
JOIN t_experiment ON t_experiment.project_id = t_project.id
WHERE t_experiment.id = $1 AND t_project.deleted = FALSE;
