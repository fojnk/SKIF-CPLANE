-- name: InsertExperimentDataset :one
INSERT INTO t_experiment_dataset (experiment_id, dataset_id, alias)
VALUES ($1, $2, $3)
RETURNING id;

-- name: InsertExperimentDatasets :batchone
INSERT INTO t_experiment_dataset (experiment_id, dataset_id, alias)
VALUES ($1, $2, $3)
    RETURNING id;

-- name: DeleteExperimentDataset :exec
DELETE FROM t_experiment_dataset
WHERE id = $1
AND experiment_id = $2;

-- name: GetExperimentDatasets :many
SELECT
    t_experiment_dataset.id AS link_id,
    t_experiment_dataset.alias AS alias,
    t_dataset.name AS name,
    t_dataset.type AS type,
    t_dataset.id AS dataset_id,
    t_project.id AS project_id,
    t_project.name AS project_name
FROM t_experiment_dataset
JOIN t_dataset ON t_experiment_dataset.dataset_id = t_dataset.id
JOIN t_project ON t_dataset.project_id = t_project.id
WHERE t_experiment_dataset.experiment_id = $1 AND t_dataset.deleted = FALSE
ORDER BY t_experiment_dataset.alias, t_dataset.name;

-- name: GetExperimentDataset :one
SELECT
    t_experiment_dataset.id AS link_id,
    t_experiment_dataset.alias AS alias,
    t_dataset.name AS name,
    t_dataset.type AS type,
    t_dataset.id AS dataset_id,
    t_project.id AS project_id,
    t_project.name AS project_name
FROM t_experiment_dataset
         JOIN t_dataset ON t_experiment_dataset.dataset_id = t_dataset.id
         JOIN t_project ON t_dataset.project_id = t_project.id
WHERE t_experiment_dataset.experiment_id = $1 AND t_dataset.deleted = FALSE AND t_experiment_dataset.alias = $2;

-- name: GetDatasetLinkedExperiments :many
SELECT
    t_experiment_dataset.id AS link_id,
    t_experiment_dataset.alias AS alias,
    t_experiment.id AS experiment_id,
    real_pt_v.name AS experiment_name,
    t_project.id AS project_id,
    t_project.name AS project_name,
    COUNT(*) OVER() AS total
FROM t_experiment_dataset
        LEFT JOIN t_experiment ON t_experiment_dataset.experiment_id = t_experiment.id
        LEFT JOIN t_experiment_template_v pt_v ON t_experiment.template_v_id = pt_v.id
        LEFT JOIN t_experiment_template real_pt_v ON pt_v.parent_id = real_pt_v.id
        LEFT JOIN t_dataset ON t_experiment_dataset.dataset_id = t_dataset.id
        LEFT JOIN t_project ON t_experiment.project_id = t_project.id
WHERE t_experiment_dataset.dataset_id = $1 AND t_dataset.deleted = FALSE AND t_project.deleted = FALSE
    AND (t_experiment.id IS NULL OR real_pt_v.deleted IS NULL OR real_pt_v.deleted = FALSE)
ORDER BY real_pt_v.name
LIMIT $2 OFFSET $3;

-- name: GetTableDuplicates :many
WITH duplicates AS (
    SELECT
        substring(COALESCE(jsonb_extract_path_text(safe_jsonb_parse(ds.params), 'YT', 'Cluster'), '') from '^[^.]+') AS cluster_prefix,
        COALESCE(jsonb_extract_path_text(safe_jsonb_parse(ds.params), 'YT', 'Path'), '') AS path,
    COUNT(*) as cnt
FROM t_dataset ds
GROUP BY cluster_prefix, path
HAVING COUNT(*) > 1
    )
SELECT t.id, t.name, d.cluster_prefix ,d.cnt
FROM t_dataset t
         JOIN duplicates d ON
    substring(COALESCE(jsonb_extract_path_text(safe_jsonb_parse(t.params), 'YT', 'Cluster'), '') from '^[^.]+') = d.cluster_prefix
        AND COALESCE(jsonb_extract_path_text(safe_jsonb_parse(t.params), 'YT', 'Path'), '') = d.path
Where t.deleted = false
GROUP BY d.cluster_prefix, d.path;

-- name: GetDuplicateListing :many
SELECT
    substring(COALESCE(jsonb_extract_path_text(safe_jsonb_parse(ds.params), 'YT', 'Cluster'), '') from '^[^.]+') AS cluster_prefix,
    COALESCE(jsonb_extract_path_text(safe_jsonb_parse(ds.params), 'YT', 'Path'), '') AS path,
    array_agg(ds.id) AS dataset_ids,
    COUNT(*) AS cnt
FROM t_dataset ds Where ds.deleted = false
GROUP BY cluster_prefix, path
HAVING COUNT(*) > 1
ORDER BY cluster_prefix, path;

-- name: CheckYTDatasetDuplicate :many
SELECT ds.id
FROM t_dataset ds
         LEFT JOIN t_dataset_v ds_v ON ds_v.id = ds.version_id
WHERE substring(
              COALESCE(
                  jsonb_extract_path_text(
                          safe_jsonb_parse(COALESCE(ds_v.params, ds.params)),
                          'YT', 'Cluster'
                  ),
                  ''
              )
          from '^[^.]+') ILIKE '%' || substring(@cluster::text from '^[^.]+') || '%'
  AND COALESCE(
        jsonb_extract_path_text(
                safe_jsonb_parse(COALESCE(ds_v.params, ds.params)),
                'YT', 'Path'
        ),
        ''
    ) = @path::text
  AND ds.deleted = false;

-- name: CheckKafkaDatasetDuplicate :many
SELECT ds.id
FROM
    t_dataset ds
    LEFT JOIN t_dataset_v ds_v ON ds_v.id = ds.version_id
WHERE
    COALESCE(
        jsonb_extract_path_text(
            safe_jsonb_parse (
                COALESCE(ds_v.params, ds.params)
            ),
            'Kafka',
            'Brokers'
        ),
        ''
    ) = @brokers::text
    AND COALESCE(
        jsonb_extract_path_text(
            safe_jsonb_parse (
                COALESCE(ds_v.params, ds.params)
            ),
            'Kafka',
            'Topic'
        ),
        ''
    ) = @topic::text
    AND ds.deleted = false;

-- name: ProjectAbcGroupListing :many
SELECT
    pr.id, pr.name, pr.abc_product_id,
    COALESCE(jsonb_extract_path_text(safe_jsonb_parse(t_project_config_v.config::text), 'AbcProductId'), '') AS abcProductIdFromConfig
FROM t_project pr
JOIN t_project_config_v ON pr.project_version_id = t_project_config_v.id
Where pr.deleted = false;

-- name: UpdateProjectAbcGroup :exec
UPDATE t_project pr
SET abc_product_id = COALESCE(
        NULLIF(jsonb_extract_path_text(safe_jsonb_parse(t_project_config_v.config::text), 'AbcProductId'), ''),
        pr.abc_product_id
    )
    FROM t_project_config_v
WHERE pr.project_version_id = t_project_config_v.id
  AND pr.deleted = false
  AND (jsonb_extract_path_text(safe_jsonb_parse(t_project_config_v.config::text), 'AbcProductId') IS NOT NULL
  AND jsonb_extract_path_text(safe_jsonb_parse(t_project_config_v.config::text), 'AbcProductId') <> '');


