-- name: ExperimentStart :exec
UPDATE t_experiment
SET status = 'pending start'
WHERE id = $1 AND deleted = FALSE;

-- name: ExperimentStop :exec
UPDATE t_experiment
SET status = 'stopped' WHERE id = $1 AND deleted = FALSE;

-- name: ExperimentStatus :one
SELECT status FROM t_experiment WHERE id = $1 AND deleted = FALSE;

-- name: UpdateExperimentDataset :exec
UPDATE t_experiment_dataset
SET alias = $3
WHERE id = $1
AND experiment_id = $2;

-- name: UpdateExperimentDatasetIDInLink :exec
UPDATE t_experiment_dataset
SET dataset_id = $1
WHERE id = $2 AND experiment_id = $3;

-- name: DatasetFromLink :one
SELECT t_dataset.id, t_experiment_dataset.alias FROM t_dataset
JOIN t_experiment_dataset ON t_experiment_dataset.dataset_id = t_dataset.id
WHERE t_experiment_dataset.id = $1 AND t_dataset.deleted = FALSE;

-- name: DatasetFromLinkByAlias :one
SELECT t_dataset.id, t_experiment_dataset.alias FROM t_dataset
JOIN t_experiment_dataset ON t_experiment_dataset.dataset_id = t_dataset.id
WHERE t_experiment_dataset.alias = $1 AND t_dataset.deleted = FALSE AND t_experiment_dataset.experiment_id = $2;

-- name: GetExperimentVariables :many
SELECT pr.id, pr.name, pr_v.type, pr.version_id, pr_v.version as version_name_id, pr.updated_at
FROM t_experiment_variable pr
JOIN t_experiment_variable_v pr_v ON pr.version_id = pr_v.id
WHERE pr.experiment_id = $1;

-- name: GetExperimentVariables2 :many
SELECT pr.id, pr.name, pr_v.type, pr_v.value
FROM t_experiment_variable pr
JOIN t_experiment_variable_v pr_v ON pr.version_id = pr_v.id
WHERE pr.experiment_id = $1;

-- name: InsertExperimentVariable :one
INSERT INTO t_experiment_variable (experiment_id, name) VALUES ($1, $2) RETURNING id;

-- name: InsertExperimentVariables :batchone
INSERT INTO t_experiment_variable (experiment_id, name, value, type) VALUES ($1, $2, $3, $4) RETURNING id;

-- name: InsertExperimentVariablesV2 :batchone
WITH new_variable AS (
INSERT INTO t_experiment_variable (experiment_id, name)
VALUES ($1, $2)
    RETURNING id
    ),
    new_version AS (
INSERT INTO t_experiment_variable_v (variable_id, version, value, type, created_at, creator, comment)
SELECT id, 1, $3, $4, NOW(), $5, $6
FROM new_variable
    RETURNING t_experiment_variable_v.variable_id, t_experiment_variable_v.id AS version_id
    )
UPDATE t_experiment_variable tpv
SET version_id = nv.version_id
    FROM new_version nv
WHERE tpv.id = nv.variable_id
    RETURNING tpv.id;

-- name: UpdateExperimentVariable :exec
UPDATE t_experiment_variable SET
name = CASE WHEN @name::text != '' THEN @name::text ELSE name END
WHERE id = $1;

-- name: InsertExperimentVariableVersion :one
INSERT INTO t_experiment_variable_v (variable_id, version, value, type, comment, creator)
SELECT $1, COALESCE(MAX(version), 0) + 1, $2, $3, $4, $5 FROM t_experiment_variable_v WHERE variable_id = $1
    RETURNING *;

-- name: UpdateExperimentVariableVersion :one
UPDATE t_experiment_variable SET
   version_id = $2,
   updated_at = NOW()
WHERE id = $1 RETURNING *;

-- name: UpdateExperimentVariableVersionComment :one
UPDATE t_experiment_variable_v SET
        comment = CASE WHEN @comment::text != '' THEN @comment::text ELSE comment END
WHERE id = $1 RETURNING *;

-- name: DeleteExperimentVariable :exec
DELETE FROM t_experiment_variable WHERE id = $1;

-- name: SelectExperimentVariable :one
SELECT pr.id, pr.name, pr_v.value, pr_v.type, pr.experiment_id, pr.version_id as version_id, pr_v.version as version_id_name
FROM t_experiment_variable pr
JOIN t_experiment_variable_v pr_v ON pr.version_id = pr_v.id
WHERE pr.id = $1;

-- name: SelectExperimentVariableV2 :one
SELECT pr.id, pr.name, pr_v.value, pr_v.type, pr.experiment_id, pr.version_id
FROM t_experiment_variable pr
         JOIN t_experiment_variable_v pr_v ON pr.version_id = pr_v.id
WHERE pr.name = $1 AND pr.experiment_id = $2;

-- name: DeleteExperimentVariableByExperimentID :exec
DELETE FROM t_experiment_variable WHERE id = $1;

-- name: InsertExperimentAppliedVersion :exec
INSERT INTO t_experiment_status (experiment_id, current_version, orch_config, last_updated)
VALUES ($1, $2, $3,NOW())
ON CONFLICT (experiment_id) DO UPDATE SET
current_version = EXCLUDED.current_version,
orch_config = EXCLUDED.orch_config
RETURNING *;

-- name: SelectExperimentAppliedVersion :one
SELECT * FROM t_experiment_status WHERE experiment_id = $1;

-- name: UpdateExperimentAppliedVersion :exec
UPDATE t_experiment_status
SET current_version = $1,
    orch_config = $2,
    last_updated = NOW()
WHERE experiment_id = $2;

-- name: DeleteAppliedVersion :exec
DELETE FROM t_experiment_status WHERE id = $1;