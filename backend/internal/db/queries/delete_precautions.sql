-- name: GetProjectsCount :one
SELECT COUNT(*) FROM v_real_project WHERE namespace_id = $1;

-- name: GetDatasetsCount :one
SELECT COUNT(*) FROM v_real_dataset WHERE namespace_id = $1;

-- name: GetDatasetsCountInProject :one
SELECT COUNT(*) FROM v_real_dataset WHERE project_id = $1;

-- name: GetExperimentsCount :one
SELECT COUNT(*) FROM t_experiment
JOIN t_experiment_template_v ON t_experiment.template_v_id = t_experiment_template_v.id
JOIN v_real_experiment_template ON t_experiment_template_v.parent_id = v_real_experiment_template.id
WHERE t_experiment.project_id = $1;

-- name: GetLinksCountByExperimentID :one
SELECT COUNT(*)
FROM t_experiment_dataset
JOIN t_dataset ON t_experiment_dataset.dataset_id = t_dataset.id
WHERE experiment_id = $1 AND t_dataset.deleted = FALSE;

-- name: GetLinksCountByDatasetID :one
SELECT COUNT(*)
FROM t_experiment_dataset
JOIN t_dataset ON t_experiment_dataset.dataset_id = t_dataset.id
WHERE dataset_id = $1 AND t_dataset.deleted = FALSE;
