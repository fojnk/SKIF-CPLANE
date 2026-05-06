-- Патч шаблона демо: parameters моделей пустые, чтобы CPLANE обогатил датасеты.
-- t_experiment_template_v.config имеет тип TEXT (см. 000001_init).
UPDATE t_experiment_template_v ptv
SET config = $cfg$
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
      "parameters": {}
    },
    {
      "modelId": "m2",
      "name": "c-simulation",
      "order": 2,
      "version": "1.0",
      "language": "C",
      "modelPath": "model_02",
      "parameters": {}
    }
  ]
}
$cfg$
FROM t_experiment_template pt
JOIN t_namespace n ON pt.namespace_id = n.id
WHERE ptv.parent_id = pt.id
  AND n.name = 'demo-stand-skif'
  AND n.deleted = FALSE
  AND pt.name = 'Демо пайплайн (супервизор)'
  AND pt.deleted = FALSE;
