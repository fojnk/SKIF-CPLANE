-- name: CompleteExperimentInfo :one
SELECT 
    p.id AS experiment_id,
    p.orch_id AS experiment_orch_id,
    pt.name AS experiment_name,
    pt.description AS experiment_description,
    pr.abc_product_id,
    pr.name AS project_name,
    pr.id AS project_id,
    n.name AS namespace_name,
    n.id AS namespace_id,
    prv.config AS project_config,
    nv.config AS namespace_config,
    ptv.config AS experiment_config,
    COALESCE(json_agg(
        json_build_object(
            'alias', pd.alias,
            'id', ds.id,
            'name', ds.name,
            'params', ds_v.params,
            'schema', ds_v.schema,
            'type', ds_v.type,
            'managed',  ds_v.managed
        )
    ) FILTER (WHERE pd.id IS NOT NULL), '[]'::json)::json AS datasets,
    COALESCE(json_agg(
        json_build_object(
            'name', pv.name,
            'value', pv_v.value,
            'type', pv_v.type
        )
    ) FILTER (WHERE pv.id IS NOT NULL), '[]'::json)::json AS variables
FROM 
    t_experiment p
JOIN 
    v_real_project pr ON p.project_id = pr.id
JOIN
    t_project_config_v prv ON pr.project_version_id = prv.id
JOIN 
    v_real_namespace n ON pr.namespace_id = n.id
JOIN
    t_namespace_config_v nv ON n.namespace_version_id = nv.id
JOIN 
    t_experiment_template_v ptv ON p.template_v_id = ptv.id
JOIN
    v_real_experiment_template pt ON ptv.parent_id = pt.id
LEFT JOIN
    t_experiment_dataset pd ON p.id = pd.experiment_id
LEFT JOIN
    v_real_dataset ds ON pd.dataset_id = ds.id
LEFT JOIN
    t_dataset_v ds_v ON ds.version_id = ds_v.id
LEFT JOIN
    t_experiment_variable pv ON p.id = pv.experiment_id
LEFT JOIN
    t_experiment_variable_v pv_v ON pv.version_id = pv_v.id
WHERE 
    p.id = $1
GROUP BY 
    p.id, p.orch_id, pt.name, pr.name, pr.id, n.name, n.id, prv.config, nv.config, ptv.config, pr.abc_product_id, pt.description;
