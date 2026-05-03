-- name: InsertNamespaceUpdateLog :exec
INSERT INTO t_namespace_update_log (namespace_id, username, act, details, comment)
VALUES ($1, $2, $3, $4, $5);

-- name: SelectNamespaceUpdateLogs :many
SELECT t_namespace_update_log.*, COUNT(*) OVER() AS total, COALESCE(v_real_namespace.name, '[deleted]') AS name FROM t_namespace_update_log
LEFT JOIN v_real_namespace ON t_namespace_update_log.namespace_id = v_real_namespace.id
WHERE t_namespace_update_log.namespace_id = $1
ORDER BY t_namespace_update_log.created_at DESC
OFFSET $2
LIMIT $3;

-- name: SelectAllNamespacesUpdateLogs :many
SELECT t_namespace_update_log.*, COUNT(*) OVER() AS total, COALESCE(v_real_namespace.name, '[deleted]') AS name FROM t_namespace_update_log
LEFT JOIN v_real_namespace ON t_namespace_update_log.namespace_id = v_real_namespace.id
ORDER BY t_namespace_update_log.created_at DESC
OFFSET $1
LIMIT $2;

-- name: InsertProjectUpdateLog :exec
INSERT INTO t_project_update_log (namespace_id, project_id, username, act, details, comment)
VALUES ($1, $2, $3, $4, $5, $6);

-- name: SelectProjectUpdateLogs :many
SELECT t_project_update_log.*, COUNT(*) OVER() AS total, COALESCE(v_real_project.name, '[deleted]') AS name FROM t_project_update_log
LEFT JOIN v_real_project ON t_project_update_log.project_id = v_real_project.id
WHERE t_project_update_log.project_id = $1
ORDER BY t_project_update_log.created_at DESC
OFFSET $2
LIMIT $3;

-- name: SelectAllProjectsUpdateLogs :many
SELECT t_project_update_log.*, COUNT(*) OVER() AS total, COALESCE(v_real_project.name, '[deleted]') AS name FROM t_project_update_log
LEFT JOIN v_real_project ON t_project_update_log.project_id = v_real_project.id
WHERE t_project_update_log.namespace_id = $1
ORDER BY t_project_update_log.created_at DESC
OFFSET $2
LIMIT $3;

-- name: InsertDatasetUpdateLog :exec
INSERT INTO t_dataset_update_log (namespace_id, project_id,  dataset_id, username, act, details, comment)
VALUES ($1, $2, $3, $4, $5, $6, $7);

-- name: InsertDatasetUpdateLogV2 :exec
INSERT INTO t_dataset_update_log (project_id,  dataset_id, username, act, details, comment)
VALUES ($1, $2, $3, $4, $5, $6);

-- name: SelectDatasetUpdateLogs :many
SELECT t_dataset_update_log.*, COUNT(*) OVER() AS total, COALESCE(v_real_dataset.name, '[deleted]') AS name FROM t_dataset_update_log
LEFT JOIN v_real_dataset ON t_dataset_update_log.dataset_id = v_real_dataset.id
WHERE t_dataset_update_log.dataset_id = $1
ORDER BY t_dataset_update_log.created_at DESC
OFFSET $2
LIMIT $3;

-- name: SelectAllDatasetsUpdateLogsByNamespaceID :many
SELECT t_dataset_update_log.*, COUNT(*) OVER() AS total, COALESCE(v_real_dataset.name, '[deleted]') AS name FROM t_dataset_update_log
LEFT JOIN v_real_dataset ON t_dataset_update_log.dataset_id = v_real_dataset.id
WHERE t_dataset_update_log.namespace_id = $1
ORDER BY t_dataset_update_log.created_at DESC
OFFSET $2
LIMIT $3;

-- name: SelectAllDatasetsUpdateLogsByProjdectID :many
SELECT t_dataset_update_log.*, COUNT(*) OVER() AS total, COALESCE(v_real_dataset.name, '[deleted]') AS name FROM t_dataset_update_log
                                                                                                                           LEFT JOIN v_real_dataset ON t_dataset_update_log.dataset_id = v_real_dataset.id
WHERE t_dataset_update_log.project_id = $1
ORDER BY t_dataset_update_log.created_at DESC
OFFSET $2
    LIMIT $3;


-- name: InsertExperimentUpdateLog :exec
INSERT INTO t_experiment_update_log (project_id, experiment_id, username, act, details, comment)
VALUES ($1, $2, $3, $4, $5, $6);

-- name: SelectExperimentUpdateLogs :many
SELECT t_experiment_update_log.*, COUNT(*) OVER() AS total, COALESCE(v_real_experiment_template.name, '[deleted]') AS name FROM t_experiment_update_log
LEFT JOIN t_experiment ON t_experiment_update_log.experiment_id = t_experiment.id
LEFT JOIN t_experiment_template_v ON t_experiment.template_v_id = t_experiment_template_v.id
LEFT JOIN v_real_experiment_template ON t_experiment_template_v.parent_id = v_real_experiment_template.id
WHERE t_experiment_update_log.experiment_id = $1
ORDER BY t_experiment_update_log.created_at DESC
OFFSET $2
LIMIT $3;

-- name: SelectExperimentUpdateLogsByActs :many
SELECT t_experiment_update_log.*, COUNT(*) OVER() AS total, COALESCE(v_real_experiment_template.name, '[deleted]') AS name FROM t_experiment_update_log
LEFT JOIN t_experiment ON t_experiment_update_log.experiment_id = t_experiment.id
LEFT JOIN t_experiment_template_v ON t_experiment.template_v_id = t_experiment_template_v.id
LEFT JOIN v_real_experiment_template ON t_experiment_template_v.parent_id = v_real_experiment_template.id
WHERE t_experiment_update_log.experiment_id = $1
  AND t_experiment_update_log.act = ANY(@acts::text[])
ORDER BY t_experiment_update_log.created_at DESC
OFFSET $2
LIMIT $3;

-- name: SelectAllExperimentsUpdateLogs :many
SELECT t_experiment_update_log.*, COUNT(*) OVER() AS total, COALESCE(v_real_experiment_template.name, '[deleted]') AS name FROM t_experiment_update_log
LEFT JOIN t_experiment ON t_experiment_update_log.experiment_id = t_experiment.id
LEFT JOIN t_experiment_template_v ON t_experiment.template_v_id = t_experiment_template_v.id
LEFT JOIN v_real_experiment_template ON t_experiment_template_v.parent_id = v_real_experiment_template.id
WHERE t_experiment_update_log.project_id = $1
ORDER BY t_experiment_update_log.created_at DESC
OFFSET $2
LIMIT $3;

-- name: SelectNamespaceLog :one
SELECT t_namespace_update_log.*, COALESCE(v_real_namespace.name, '[deleted]') AS name FROM t_namespace_update_log
LEFT JOIN v_real_namespace ON t_namespace_update_log.namespace_id = v_real_namespace.id
WHERE t_namespace_update_log.id = $1;

-- name: SelectProjectLog :one
SELECT t_project_update_log.*, COALESCE(v_real_project.name, '[deleted]') AS name FROM t_project_update_log
LEFT JOIN v_real_project ON t_project_update_log.project_id = v_real_project.id
WHERE t_project_update_log.id = $1;

-- name: SelectDatasetLog :one
SELECT t_dataset_update_log.*, COALESCE(v_real_dataset.name, '[deleted]') AS name FROM t_dataset_update_log
LEFT JOIN v_real_dataset ON t_dataset_update_log.dataset_id = v_real_dataset.id
WHERE t_dataset_update_log.id = $1;

-- name: SelectExperimentLog :one
SELECT t_experiment_update_log.*, COALESCE(v_real_experiment_template.name, '[deleted]') AS name FROM t_experiment_update_log
LEFT JOIN t_experiment ON t_experiment_update_log.experiment_id = t_experiment.id
LEFT JOIN t_experiment_template_v ON t_experiment.template_v_id = t_experiment_template_v.id
LEFT JOIN v_real_experiment_template ON t_experiment_template_v.parent_id = v_real_experiment_template.id
WHERE t_experiment_update_log.id = $1;

-- name: UpdateDatasetLogComment :exec
UPDATE t_dataset_update_log SET comment=$1 WHERE id=$2;

-- name: UpdateProjectLogComment :exec
UPDATE t_project_update_log SET comment=$1 WHERE id=$2;

-- name: UpdateNamespaceLogComment :exec
UPDATE t_namespace_update_log SET comment=$1 WHERE id=$2;

-- name: UpdateExperimentLogComment :exec
UPDATE t_experiment_update_log SET comment=$1 WHERE id=$2;