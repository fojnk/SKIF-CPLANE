-- name: CheckExperimentLimit :one
SELECT
    CASE WHEN EXISTS (
        SELECT 1
        FROM t_namespace n
                 LEFT JOIN t_project p ON p.namespace_id = n.id
                 LEFT JOIN t_experiment pl ON pl.project_id = p.id

        WHERE
            pl.id = $1 AND
            (pl.unlimited = true OR
            p.unlimited = true OR
            n.unlimited = true)
    ) THEN 1 ELSE 0 END AS unlimited;