-- Откат демо-стенда (namespace demo-stand-skif).

DO $$
DECLARE
  v_ns_id INTEGER;
BEGIN
  SELECT id INTO v_ns_id FROM t_namespace WHERE name = 'demo-stand-skif' AND deleted = FALSE LIMIT 1;
  IF v_ns_id IS NULL THEN
    RAISE NOTICE '000008_demo_stand_seed down: namespace demo-stand-skif не найден, пропуск';
  ELSE
  DELETE FROM t_experiment_update_log
  WHERE experiment_id IN (
    SELECT e.id FROM t_experiment e
    JOIN t_project p ON e.project_id = p.id
    WHERE p.namespace_id = v_ns_id
  );

  DELETE FROM t_experiment_status
  WHERE experiment_id IN (
    SELECT e.id FROM t_experiment e
    JOIN t_project p ON e.project_id = p.id
    WHERE p.namespace_id = v_ns_id
  );

  DELETE FROM t_experiment_variable_v
  WHERE variable_id IN (
    SELECT ev.id FROM t_experiment_variable ev
    JOIN t_experiment e ON ev.experiment_id = e.id
    JOIN t_project p ON e.project_id = p.id
    WHERE p.namespace_id = v_ns_id
  );

  DELETE FROM t_experiment_variable
  WHERE experiment_id IN (
    SELECT e.id FROM t_experiment e
    JOIN t_project p ON e.project_id = p.id
    WHERE p.namespace_id = v_ns_id
  );

  DELETE FROM t_experiment_dataset
  WHERE experiment_id IN (
    SELECT e.id FROM t_experiment e
    JOIN t_project p ON e.project_id = p.id
    WHERE p.namespace_id = v_ns_id
  );

  DELETE FROM t_experiment
  WHERE project_id IN (SELECT id FROM t_project WHERE namespace_id = v_ns_id);

  DELETE FROM t_dataset_v
  WHERE dataset_id IN (SELECT id FROM t_dataset WHERE project_id IN (SELECT id FROM t_project WHERE namespace_id = v_ns_id));

  DELETE FROM t_dataset
  WHERE project_id IN (SELECT id FROM t_project WHERE namespace_id = v_ns_id);

  DELETE FROM t_experiment_template_v
  WHERE parent_id IN (SELECT id FROM t_experiment_template WHERE namespace_id = v_ns_id);

  DELETE FROM t_experiment_template
  WHERE namespace_id = v_ns_id;

  DELETE FROM t_project_config_v
  WHERE project_id IN (SELECT id FROM t_project WHERE namespace_id = v_ns_id);

  DELETE FROM t_project
  WHERE namespace_id = v_ns_id;

  DELETE FROM t_namespace_config_v
  WHERE namespace_id = v_ns_id;

  DELETE FROM t_namespace
  WHERE id = v_ns_id;

  RAISE NOTICE '000008_demo_stand_seed down: удалён demo-stand-skif';
  END IF;
END $$;
