-- Демо-стенд: неймспейс, проект, датасеты, шаблон и эксперимент в формате супервизора.
-- Идемпотентно: при повторном прогоне ничего не дублируется (маркер — t_namespace.name = 'demo-stand-skif').

DO $$
DECLARE
  v_ns_id     INTEGER;
  v_nsv_id    INTEGER;
  v_proj_id   INTEGER;
  v_pcv_id    INTEGER;
  v_tmpl_id   INTEGER;
  v_tmplv_id  INTEGER;
  v_exp_id    INTEGER;
  v_ds1_id    INTEGER;
  v_ds1v_id   INTEGER;
  v_ds2_id    INTEGER;
  v_ds2v_id   INTEGER;
  v_var_id    INTEGER;
  v_varv_id   INTEGER;
BEGIN
  IF EXISTS (SELECT 1 FROM t_namespace WHERE name = 'demo-stand-skif' AND deleted = FALSE) THEN
    RAISE NOTICE '000008_demo_stand_seed: уже применена (namespace demo-stand-skif), пропуск';
  ELSE
  INSERT INTO t_namespace (name, deleted, unlimited)
  VALUES ('demo-stand-skif', FALSE, FALSE)
  RETURNING id INTO v_ns_id;

  INSERT INTO t_namespace_config_v (namespace_id, version_id, config)
  VALUES (
    v_ns_id,
    1,
    '{"demo_stand": true, "title": "Демонстрационный стенд СКИФ", "description": "Готовая рабочая зона для проверки CPLANE"}'::jsonb
  )
  RETURNING id INTO v_nsv_id;

  UPDATE t_namespace SET namespace_version_id = v_nsv_id WHERE id = v_ns_id;

  INSERT INTO t_project (namespace_id, name, description, abc_product_id)
  VALUES (
    v_ns_id,
    'Демо-проект оптической цепочки',
    'Проект с датасетами и двухшаговым пайплайном (Python + C) для Java-супервизора и RabbitMQ.',
    ''
  )
  RETURNING id INTO v_proj_id;

  INSERT INTO t_project_config_v (project_id, version_id, config)
  VALUES (
    v_proj_id,
    1,
    '{"demo_stand": true, "beamline": "example-ID12", "note": "Конфиг проекта для демонстрации UI"}'::jsonb
  )
  RETURNING id INTO v_pcv_id;

  UPDATE t_project SET project_version_id = v_pcv_id WHERE id = v_proj_id;

  INSERT INTO t_experiment_template (namespace_id, name, description)
  VALUES (
    v_ns_id,
    'Демо пайплайн (супервизор)',
    'Два шага в формате ExperimentRequest: предобработка (PYTHON) и симуляция (C). См. backend/json/supervisor_experiment.example.json.'
  )
  RETURNING id INTO v_tmpl_id;

  INSERT INTO t_experiment_template_v (parent_id, version_id, yql, config, creator, comment, additional_information)
  VALUES (
    v_tmpl_id,
    1,
    '-- Демо: исполнение через Java-супервизор (YQL не используется)',
    $demo_cfg$
{
  "experimentName": "demo-two-step-pipeline",
  "models": [
    {
      "modelId": "m1",
      "name": "python-preprocess",
      "order": 1,
      "version": "1.0",
      "language": "PYTHON",
      "modelPath": "model_01",
      "parameters": {
        "input_datasets": ["beam_input"]
      }
    },
    {
      "modelId": "m2",
      "name": "c-simulation",
      "order": 2,
      "version": "1.0",
      "language": "C",
      "modelPath": "model_02",
      "parameters": {
        "input_datasets": ["beam_input"],
        "output_datasets": ["detector_output"]
      }
    }
  ]
}
$demo_cfg$,
    'demo-stand',
    'seed 000008_demo_stand_seed',
    '{}'::jsonb
  )
  RETURNING id INTO v_tmplv_id;

  INSERT INTO t_experiment (template_v_id, project_id, status)
  VALUES (v_tmplv_id, v_proj_id, 'idle')
  RETURNING id INTO v_exp_id;

  INSERT INTO t_dataset (name, type, params, schema, public, managed, project_id, namespace_id, deleted)
  VALUES (
    'Демо — параметры пучка',
    'json',
    '{"energy_keV": 12.0, "flux_estimate": 1e12, "station": "ID12"}',
    '{"type": "object", "properties": {"energy_keV": {"type": "number"}, "flux_estimate": {"type": "number"}, "station": {"type": "string"}}}',
    FALSE,
    FALSE,
    v_proj_id,
    v_ns_id,
    FALSE
  )
  RETURNING id INTO v_ds1_id;

  INSERT INTO t_dataset_v (dataset_id, version, params, schema, type, managed, public, comment, creator)
  VALUES (
    v_ds1_id,
    1,
    '{"energy_keV": 12.0, "flux_estimate": 1e12, "station": "ID12"}',
    '{"type": "object", "properties": {"energy_keV": {"type": "number"}, "flux_estimate": {"type": "number"}, "station": {"type": "string"}}}',
    'json',
    FALSE,
    FALSE,
    'seed',
    'demo-stand'
  )
  RETURNING id INTO v_ds1v_id;

  UPDATE t_dataset SET version_id = v_ds1v_id WHERE id = v_ds1_id;

  INSERT INTO t_dataset (name, type, params, schema, public, managed, project_id, namespace_id, deleted)
  VALUES (
    'Демо — выход детектора (шаблон)',
    'json',
    '{"format": "hdf5", "preview_rows": 100}',
    '{"type": "object", "properties": {"format": {"type": "string"}, "preview_rows": {"type": "integer"}}}',
    FALSE,
    FALSE,
    v_proj_id,
    v_ns_id,
    FALSE
  )
  RETURNING id INTO v_ds2_id;

  INSERT INTO t_dataset_v (dataset_id, version, params, schema, type, managed, public, comment, creator)
  VALUES (
    v_ds2_id,
    1,
    '{"format": "hdf5", "preview_rows": 100}',
    '{"type": "object", "properties": {"format": {"type": "string"}, "preview_rows": {"type": "integer"}}}',
    'json',
    FALSE,
    FALSE,
    'seed',
    'demo-stand'
  )
  RETURNING id INTO v_ds2v_id;

  UPDATE t_dataset SET version_id = v_ds2v_id WHERE id = v_ds2_id;

  INSERT INTO t_experiment_dataset (experiment_id, dataset_id, alias)
  VALUES
    (v_exp_id, v_ds1_id, 'beam_input'),
    (v_exp_id, v_ds2_id, 'detector_output');

  INSERT INTO t_experiment_variable (experiment_id, name)
  VALUES (v_exp_id, 'demo_notes')
  RETURNING id INTO v_var_id;

  INSERT INTO t_experiment_variable_v (variable_id, version, value, type, comment, creator)
  VALUES (
    v_var_id,
    1,
    'Демонстрационный пайплайн — данные из миграции 000008',
    'string',
    'seed',
    'demo-stand'
  )
  RETURNING id INTO v_varv_id;

  UPDATE t_experiment_variable SET version_id = v_varv_id WHERE id = v_var_id;

  RAISE NOTICE '000008_demo_stand_seed: создан namespace_id=%, project_id=%, experiment_id=%', v_ns_id, v_proj_id, v_exp_id;
  END IF;
END $$;
