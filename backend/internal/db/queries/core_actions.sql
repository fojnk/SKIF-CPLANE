-- name: TemplateIDByExperimentID :one
SELECT v_real_experiment_template.id FROM v_real_experiment_template
JOIN t_experiment_template_v ON t_experiment_template_v.parent_id = v_real_experiment_template.id
JOIN t_experiment ON t_experiment.template_v_id = t_experiment_template_v.id
WHERE t_experiment.id = $1;

-- name: BaseTemplateIDByExperimentID :one
SELECT t_experiment_template_v.id FROM v_real_experiment_template
JOIN t_experiment_template_v ON t_experiment_template_v.parent_id = v_real_experiment_template.id
JOIN t_experiment ON t_experiment.template_v_id = t_experiment_template_v.id
WHERE t_experiment.id = $1;

-- name: SelectCompleteExperimentsInProject :many
SELECT t_experiment.id, v_real_experiment_template.name, t_experiment_template_v.config, t_experiment_template_v.yql, t_experiment_template_v.config_patch, t_experiment.orch_id
FROM t_experiment
JOIN t_experiment_template_v ON t_experiment.template_v_id = t_experiment_template_v.id
JOIN v_real_experiment_template ON t_experiment_template_v.parent_id = v_real_experiment_template.id
WHERE t_experiment.project_id = $1
ORDER BY v_real_experiment_template.name
;

-- name: SelectCompleteExperiment :one
SELECT t_experiment.id, t_experiment.project_id, v_real_experiment_template.name, v_real_experiment_template.description, t_experiment_template_v.config, t_experiment_template_v.yql, 
    t_experiment_template_v.config_patch, t_experiment.orch_id, t_experiment_template_v.additional_information
FROM t_experiment
JOIN t_experiment_template_v ON t_experiment.template_v_id = t_experiment_template_v.id
JOIN v_real_experiment_template ON t_experiment_template_v.parent_id = v_real_experiment_template.id
WHERE t_experiment.id = $1 
ORDER BY (t_experiment_template_v.created_at, t_experiment_template_v.id) DESC
;

-- name: NamespaceIDByProjectID :one
SELECT namespace_id FROM t_project
WHERE id = $1 AND deleted = FALSE;

-- name: NamespaceIDByExperimentID :one
SELECT
    n.id AS namespace_id
FROM t_experiment p
JOIN v_real_project pr ON p.project_id = pr.id
JOIN v_real_namespace n ON pr.namespace_id = n.id
WHERE p.id = $1;

-- name: DeleteAllExperimentVersions :exec
DELETE FROM t_experiment_template_v WHERE parent_id = $1;
