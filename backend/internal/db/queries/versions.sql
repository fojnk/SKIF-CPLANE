-- name: SelectExperimentVersions :many
SELECT id, version_id, created_at, comment, creator, COUNT(*) OVER() AS total FROM t_experiment_template_v WHERE parent_id = $1
ORDER BY created_at DESC
LIMIT $2 OFFSET $3;


-- name: SelectExperimentVariableVersions :many
SELECT vr_v.id, version, created_at, comment, creator, vr.name as variable_name, vr_v.variable_id, vr_v.type, 
       (version = MAX(version) OVER (PARTITION BY vr_v.variable_id)) as head,
       COUNT(*) OVER() AS total
FROM t_experiment_variable_v vr_v
JOIN t_experiment_variable vr ON vr.id = vr_v.variable_id
WHERE (COALESCE(@variable_id, 0) = 0 OR vr_v.variable_id = @variable_id)
  AND (COALESCE(@experiment_id, 0) = 0 OR vr.experiment_id = @experiment_id)
ORDER BY created_at DESC
LIMIT @limit_val OFFSET @offset_val;

-- name: SelectExperimentVariableVersion :one
SELECT vr_v.* FROM t_experiment_variable_v vr_v
WHERE vr_v.id = $1;

-- name: SelectDatasetVersions :many
SELECT id, version, created_at, comment, creator, COUNT(*) OVER() AS total FROM t_dataset_v ds_v
WHERE ds_v.dataset_id = $1
ORDER BY created_at DESC
    LIMIT $2 OFFSET $3;

-- name: SelectDatasetVersion :one
SELECT ds_v.* FROM t_dataset_v ds_v
WHERE ds_v.id = $1;

-- name: SelectDatasetCurrVersion :one
SELECT ds.version_id FROM t_dataset ds
WHERE ds.id = $1;