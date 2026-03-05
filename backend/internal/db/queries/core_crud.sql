-- name: InsertNamespace :one
INSERT INTO t_namespace(name) VALUES($1) RETURNING id;

-- name: SelectNamespaces :many
SELECT id, name FROM t_namespace WHERE deleted = FALSE ORDER BY created_at DESC;

-- name: DeleteNamespace :exec
UPDATE t_namespace SET deleted = TRUE WHERE id = $1;

-- name: UpdateNamespace :exec
UPDATE t_namespace SET name = CASE WHEN @name::text != '' THEN @name::text ELSE name END WHERE id = $1 AND deleted = FALSE;

-- name: InsertProject :one
INSERT INTO t_project(namespace_id, name, description, abc_product_id) VALUES($1, $2, $3, $4) RETURNING *;

-- name: SelectProjects :many
SELECT id, name, description, abc_product_id FROM t_project WHERE namespace_id = $1 AND deleted = FALSE ORDER BY (created_at, id) DESC;

-- name: SelectProjectsWithDeleted :many
SELECT * FROM t_project WHERE namespace_id = $1 ORDER BY (created_at, id) DESC;

-- name: SelectProjectsWithRole :many
SELECT pr.* FROM t_project pr
JOIN t_role_object_match rm ON rm.object_id = pr.id AND rm.object_type = 'project';

-- name: SelectNamespacesWithRole :many
SELECT ns.* FROM t_namespace ns
JOIN t_role_object_match rm ON rm.object_id = ns.id AND rm.object_type = 'namespace';

-- name: SelectProjectsV2 :many
WITH projects AS (
    SELECT
        pr.id,
        pr.name,
        pr.description,
        ns.name AS namespace_name,
        ns.id AS namespace_id,
        pr.abc_product_id,
        pr.created_at as created_at,
        pr.updated_at as updated_at,
        CASE WHEN pp.project_id IS NOT NULL THEN TRUE ELSE FALSE END AS is_pinned,
        COUNT(*) OVER() AS total,
        COUNT(DISTINCT pl.id) AS experiment_count,
        COUNT(DISTINCT ds.id) AS dataset_count
    FROM t_project pr
             LEFT JOIN t_namespace ns ON ns.id = pr.namespace_id
            LEFT JOIN t_experiment pl ON pl.project_id = pr.id
             LEFT JOIN t_dataset ds ON ds.project_id = pr.id AND (ds.deleted IS NULL OR ds.deleted = FALSE)
             LEFT JOIN t_experiment_template_v pt_v ON pl.template_v_id = pt_v.id
             LEFT JOIN t_experiment_template real_pt_v ON pt_v.parent_id = real_pt_v.id
             LEFT JOIN t_user_pinned_projects pp ON pp.project_id = pr.id AND pp.user_id = @user_id
    WHERE ( @namespace = 0 OR pr.namespace_id = @namespace )
      AND (
          ( @search::text IS NULL OR pr.name ILIKE '%' || @search || '%' ) OR
          ( pr.id::TEXT    ILIKE '%' || @search    || '%'   )
          )
      AND pr.deleted = FALSE
      AND (pl.id IS NULL OR real_pt_v.deleted IS NULL OR real_pt_v.deleted = FALSE)
    GROUP BY
        pr.id,
        pr.name,
        pp.project_id,
        pr.description,
        ns.name,
        ns.id,
        pr.created_at
)
SELECT * FROM projects pr
ORDER BY
    pr.is_pinned DESC,
    CASE WHEN @order_by::varchar = '' THEN pr.updated_at END DESC,
    CASE WHEN @order_by = 'id_asc' THEN pr.id END ASC,
    CASE WHEN @order_by = 'id_desc' THEN pr.id END DESC,
    CASE WHEN @order_by = 'name_asc' THEN pr.name END ASC,
    CASE WHEN @order_by = 'name_desc' THEN pr.name END DESC,
    CASE WHEN @order_by = 'namespace_asc' THEN pr.namespace_name END ASC,
    CASE WHEN @order_by = 'namespace_desc' THEN pr.namespace_name END DESC,
    CASE WHEN @order_by = 'updated_asc' THEN pr.updated_at END ASC,
    CASE WHEN @order_by = 'updated_desc' THEN pr.updated_at END DESC,
    CASE WHEN @order_by = 'created_asc' THEN pr.created_at END ASC,
    CASE WHEN @order_by = 'created_desc' THEN pr.created_at END DESC,
    CASE WHEN @order_by = 'experiments_asc' THEN pr.experiment_count END ASC,
    CASE WHEN @order_by = 'experiments_desc' THEN pr.experiment_count END DESC,
    CASE WHEN @order_by = 'ds_asc' THEN pr.dataset_count END ASC,
    CASE WHEN @order_by = 'ds_desc' THEN pr.dataset_count END DESC,
    CASE WHEN @order_by = 'abc_asc' THEN pr.abc_product_id END ASC,
    CASE WHEN @order_by = 'abc_desc' THEN pr.abc_product_id END DESC
LIMIT $1 OFFSET $2;

-- name: DeleteProject :exec
UPDATE t_project SET deleted = TRUE WHERE id = $1;

-- name: UpdateProject :one
UPDATE t_project SET name = CASE WHEN @name::text != '' THEN @name::text ELSE name END,
                     description = CASE WHEN @description::text != '' THEN @description::text ELSE description END,
                     abc_product_id = CASE WHEN @abc_product_id::text != '' THEN @abc_product_id::text ELSE abc_product_id END,
                     updated_at = now()
    WHERE id = $1 AND deleted = FALSE
    RETURNING *
;

-- name: SelectProject :one
SELECT t_project.id,
       t_project.name,
       t_project.namespace_id,
       ns.name as namespace_name,
       t_project.abc_product_id,
       t_project.description,
       t_project_config_v.id as config_version_id,
       t_project_config_v.config,
       CASE WHEN pp.project_id IS NOT NULL THEN TRUE ELSE FALSE END AS is_pinned
FROM t_project
LEFT JOIN t_user_pinned_projects pp ON pp.project_id = t_project.id AND pp.user_id = @user_id
JOIN t_project_config_v ON t_project.project_version_id = t_project_config_v.id
JOIN t_namespace ns ON ns.id = t_project.namespace_id
WHERE t_project.id = $1 AND t_project.deleted = FALSE;

-- name: SelectProjectWithoutPin :one
SELECT t_project.id,
       t_project.name,
       t_project.namespace_id,
       ns.name as namespace_name,
       t_project.abc_product_id,
       t_project.description,
       t_project_config_v.id as config_version_id,
       t_project_config_v.config
FROM t_project
         JOIN t_project_config_v ON t_project.project_version_id = t_project_config_v.id
         JOIN t_namespace ns ON ns.id = t_project.namespace_id
WHERE t_project.id = $1 AND t_project.deleted = FALSE;

-- name: SelectProjectWithDeleted :one
SELECT t_project.id,
       t_project.name,
       t_project.deleted,
       t_project.namespace_id,
       ns.name as namespace_name,
       t_project.abc_product_id,
       t_project.description,
       t_project_config_v.id as config_version_id,
       t_project_config_v.config,
       CASE WHEN pp.project_id IS NOT NULL THEN TRUE ELSE FALSE END AS is_pinned
FROM t_project
         LEFT JOIN t_user_pinned_projects pp ON pp.project_id = t_project.id AND pp.user_id = @user_id
         JOIN t_project_config_v ON t_project.project_version_id = t_project_config_v.id
         JOIN t_namespace ns ON ns.id = t_project.namespace_id
WHERE t_project.id = $1;

-- name: InsertExperimentTemplate :one
INSERT INTO t_experiment_template(namespace_id, name, description) VALUES($1, $2, $3) RETURNING id;

-- name: SelectExperimentTemplates :many
SELECT id, name FROM v_real_experiment_template WHERE namespace_id = $1;

-- name: DeleteExperimentTemplate :exec
DELETE FROM t_experiment_template WHERE id = $1;

-- name: UpdateExperimentTemplate :exec
UPDATE t_experiment_template
    SET
        name = CASE WHEN @name::text != '' THEN @name::text ELSE name END,
        description = CASE WHEN @description::text != '' THEN @description::text ELSE description END
WHERE id = $1 AND deleted = FALSE;

-- name: InsertExperimentTemplateV :one
INSERT INTO t_experiment_template_v(parent_id, version_id, yql, config, creator, comment, additional_information)
    SELECT $1, COALESCE(MAX(version_id), 0) + 1, $2, $3, $4, $5, $6 FROM t_experiment_template_v WHERE parent_id = $1
RETURNING id;

-- name: SelectExperimentTemplateVs :many
SELECT id, version_id, yql, config, config_patch FROM t_experiment_template_v WHERE parent_id = $1;

-- name: SelectExperimentTemplate :one
SELECT id, version_id, yql, config, config_patch, parent_id, created_at, comment, creator, additional_information FROM t_experiment_template_v WHERE id = $1;

-- name: UpdateExperimentTemplateV :one
UPDATE t_experiment_template_v
SET
    comment = CASE WHEN @comment::text != '' THEN @comment::text ELSE comment END
WHERE id = $1 RETURNING *;

-- name: InsertDataset :one
INSERT INTO t_dataset(name, type, params, schema, public, managed, project_id) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *;

-- name: SelectDatasetsByProjectId :many
SELECT ds.id, ds.name, ds_v.type, ds_v.params, ds_v.schema, ds_v.public, ds_v.managed
FROM t_dataset ds
JOIN t_dataset_v ds_v ON ds.version_id = ds_v.id
WHERE ds.project_id = $1 AND ds.deleted = FALSE ORDER BY ds.name;


-- name: SelectDatasets :many
WITH datasets AS (
    SELECT
        ds.id,
        ds.name,
        ds_v.type,
        ds_v.public,
        ds_v.managed,
        ds.project_id,
        pr.name        AS project_name,
        ns.id          AS namespace_id,
        ns.name        AS namespace_name,
        ds.updated_at  AS updated_at,
        ds.created_at  AS created_at,
        COUNT(DISTINCT pd.experiment_id) AS linked_experiment_count,
        COUNT(*) OVER()               AS total
    FROM t_dataset ds
             LEFT JOIN t_project pr ON pr.id = ds.project_id
             LEFT JOIN t_namespace ns ON ns.id = pr.namespace_id
             LEFT JOIN t_experiment_dataset pd ON pd.dataset_id = ds.id
             LEFT JOIN t_experiment pl ON pd.experiment_id = pl.id
             LEFT JOIN t_experiment_template_v tmp_v ON pl.template_v_id = tmp_v.id
             LEFT JOIN t_experiment_template tmp ON tmp_v.parent_id = tmp.id
             JOIN t_dataset_v ds_v ON ds.version_id = ds_v.id
    WHERE
        (ds.deleted IS NULL OR ds.deleted = FALSE)
      AND (pl.id IS NULL OR tmp.deleted IS NULL OR tmp.deleted = FALSE)
      AND (
        @search::text IS NULL OR
      	CASE WHEN @exact_match::bool IS NULL OR @exact_match::bool = FALSE THEN
      	(
          (ds.name ILIKE '%' || @search || '%') OR
          (ds.id::TEXT    ILIKE '%' || @search    || '%') OR
          (ds_v.params IS NOT NULL AND safe_jsonb_parse(ds_v.params) IS NOT NULL AND COALESCE(jsonb_extract_path_text(safe_jsonb_parse(ds_v.params), 'YT', 'Path'), '') ILIKE '%' || @search || '%')
      	)
      	WHEN @exact_match::bool = TRUE THEN
      	(
          (ds.name = @search) OR
          (ds.id::TEXT = @search) OR
          (ds_v.params IS NOT NULL AND safe_jsonb_parse(ds_v.params) IS NOT NULL AND COALESCE(jsonb_extract_path_text(safe_jsonb_parse(ds_v.params), 'YT', 'Path'), '') = @search)
      	)
      	END
      )
      AND (@type::text = '' OR ds_v.type ILIKE '%' || @type || '%')
      AND (@cluster::text = '' OR
          (ds_v.params IS NOT NULL AND safe_jsonb_parse(ds_v.params) IS NOT NULL AND COALESCE(jsonb_extract_path_text(safe_jsonb_parse(ds_v.params), 'YT', 'Cluster'), '') ILIKE '%' || @cluster || '%'))
      AND (@path::text = '' OR
          (ds_v.params IS NOT NULL AND safe_jsonb_parse(ds_v.params) IS NOT NULL AND COALESCE(jsonb_extract_path_text(safe_jsonb_parse(ds_v.params), 'YT', 'Path'), '') ILIKE '%' || @path || '%'))
      AND (@managed::bool IS NULL OR ds_v.managed = @managed)
      AND (@public::bool  IS NULL OR ds_v.public  = @public)
      AND (@namespace = 0     OR ns.id      = @namespace)
      AND (@project   = 0     OR pr.id      = @project)
      AND (
        @available_to_link::bool IS NULL
      OR (
        @available_to_link = TRUE
        AND (
          ds_v.public = TRUE
          OR ds.project_id = (
            SELECT pl2.project_id
            FROM t_experiment pl2
            WHERE pl2.id = @experiment
          )
        )
      )
        )
    GROUP BY
        ds.id, ds.name, ds_v.type, ds_v.public, ds_v.managed, ds_v.params,
        ds.project_id, pr.name, ns.id, ns.name,
        ds.updated_at, ds.created_at
)
SELECT *
FROM datasets ds
ORDER BY
    CASE WHEN @order_by::varchar = '' THEN ds.updated_at END DESC,
    CASE WHEN @order_by = 'id_asc' THEN ds.id END ASC,
    CASE WHEN @order_by = 'id_desc' THEN ds.id END DESC,
    CASE WHEN @order_by = 'name_asc' THEN ds.name END ASC,
    CASE WHEN @order_by = 'name_desc' THEN ds.name END DESC,
    CASE WHEN @order_by = 'type_asc' THEN ds.type END ASC,
    CASE WHEN @order_by = 'type_desc' THEN ds.type END DESC,
    CASE WHEN @order_by = 'public_asc' THEN ds.public END ASC,
    CASE WHEN @order_by = 'public_desc' THEN ds.public END DESC,
    CASE WHEN @order_by = 'managed_asc' THEN ds.managed END ASC,
    CASE WHEN @order_by = 'managed_desc' THEN ds.managed END DESC,
    CASE WHEN @order_by = 'namespace_asc' THEN ds.namespace_name END ASC,
    CASE WHEN @order_by = 'namespace_desc' THEN ds.namespace_name END DESC,
    CASE WHEN @order_by = 'project_asc' THEN ds.project_name END ASC,
    CASE WHEN @order_by = 'project_desc' THEN ds.project_name END DESC,
    CASE WHEN @order_by = 'updated_asc' THEN ds.updated_at END ASC,
    CASE WHEN @order_by = 'updated_desc' THEN ds.updated_at END DESC,
    CASE WHEN @order_by = 'created_asc' THEN ds.created_at END ASC,
    CASE WHEN @order_by = 'created_desc' THEN ds.created_at END DESC,
    CASE WHEN @order_by = 'links_asc' THEN ds.linked_experiment_count END ASC,
    CASE WHEN @order_by = 'links_desc' THEN ds.linked_experiment_count END DESC
LIMIT $1 OFFSET $2;

-- name: SelectDataset :one
SELECT ds.id, ds.name, ds_v.type, ds_v.params, ds_v.schema, ds_v.public, ds_v.managed, ds.project_id, ds.version_id
FROM t_dataset ds
JOIN t_dataset_v ds_v ON ds_v.id = ds.version_id
WHERE ds.id = $1 AND ds.deleted = FALSE;

-- name: DeleteDataset :exec
UPDATE t_dataset SET deleted = TRUE WHERE id = $1;


-- name: InsertDatasetVersion :one
INSERT INTO t_dataset_v (dataset_id, version, params, schema, type, managed, public, comment, creator)
SELECT $1, COALESCE(MAX(version), 0) + 1, $2, $3, $4, $5, $6, $7, $8 FROM t_dataset_v WHERE dataset_id = $1
RETURNING *;

-- name: UpdateDatasetVersion :one
UPDATE t_dataset SET
      version_id = $2,
      updated_at = NOW()
WHERE id = $1 RETURNING *;

-- name: UpdateDatasetVersionComment :one
UPDATE t_dataset_v SET
    comment = CASE WHEN @comment::text != '' THEN @comment::text ELSE comment END
WHERE id = $1 RETURNING *;

-- name: UpdateDataset :one
UPDATE t_dataset SET
    name = CASE WHEN @name::text != '' THEN @name::text ELSE name END,
    updated_at = now()
WHERE id = $1 RETURNING *;


-- name: InsertExperiment :one
INSERT INTO t_experiment(template_v_id, project_id) VALUES($1, $2) RETURNING id;

-- name: SelectExperiments :many
SELECT id, template_v_id FROM t_experiment WHERE project_id = $1 AND deleted = FALSE;

-- name: DeleteExperiment :exec
UPDATE t_experiment_template SET deleted = TRUE WHERE id IN (
    SELECT t_experiment_template_v.parent_id FROM t_experiment_template_v
    JOIN t_experiment ON t_experiment.template_v_id = t_experiment_template_v.id
    WHERE t_experiment.id = $1
);

-- name: UpdateExperiment :exec
UPDATE t_experiment SET template_v_id=$2,  updated_at = now() WHERE id = $1;

-- name: UpdateExperimentOrchID :exec
UPDATE t_experiment SET orch_id=$2 WHERE id = $1;

-- name: SelectExperiment :one
SELECT t_experiment.id, t_experiment.project_id, v_real_experiment_template.name, v_real_experiment_template.description, t_experiment_template_v.config, t_experiment_template_v.additional_information
FROM t_experiment
JOIN t_experiment_template_v ON t_experiment.template_v_id = t_experiment_template_v.id
JOIN v_real_experiment_template ON t_experiment_template_v.parent_id = v_real_experiment_template.id
WHERE t_experiment.id = $1;

-- name: SelectNamespace :one
SELECT t_namespace.id, t_namespace.name, t_namespace_config_v.id as config_version_id, t_namespace_config_v.config
FROM t_namespace
JOIN t_namespace_config_v ON t_namespace.namespace_version_id = t_namespace_config_v.id
WHERE t_namespace.id = $1 AND t_namespace.deleted = FALSE;

-- name: SelectNamespaceWithDeleted :one
SELECT t_namespace.id, t_namespace.name, t_namespace.deleted, t_namespace_config_v.id as config_version_id, t_namespace_config_v.config
FROM t_namespace
JOIN t_namespace_config_v ON t_namespace.namespace_version_id = t_namespace_config_v.id
WHERE t_namespace.id = $1;
