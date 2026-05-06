# Demo stand E2E (000008 + supervisor) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Сделать демо после миграции `000008` совместимым с честным E2E: CPLANE отдаёт в RabbitMQ обогащённые датасетами модели (`input_datasets` с `params`), `model_01` использует `energy_keV`, цепочка из двух шагов в супервизоре остаётся рабочей.

**Architecture:** Шаблон в БД содержит `models[].parameters`: **`{}`** (или только осознанные поля без `input_datasets`/`output_datasets`), чтобы `attachDatasetsToModelParameters` в `internal/pkg/supervisor/request.go` дописала полные связки. Одна маленькая правка **`development/supervisor/models/model_01/test.py`** — читать `energy_keV` из обогащённого JSON. Отдельно — опциональная миграция **`000009`** для БД, где старый `000008` уже применён.

**Tech Stack:** PostgreSQL migrations; Go 1.22+ (`go test`), Java-супервизор + Docker; Python 3.11 внутри ephemeral-образа модели.

---

## Инвентарь файлов

| Область | Файл | Назначение |
|---------|------|------------|
| CPLANE seed | `SKIF-CPLANE/backend/migrations/up/000008_demo_stand_seed.up.sql` | JSON шаблона `t_experiment_template_v.config`: убрать строковые `input_datasets`/`output_datasets` из `parameters`. |
| CPLANE optional patch | `SKIF-CPLANE/backend/migrations/up/000009_demo_stand_template_supervisor_fixup.up.sql` (создать) | PATCH для уже развёрнутых стендов. |
| CPLANE migrate down | `SKIF-CPLANE/backend/migrations/down/000009_demo_stand_template_supervisor_fixup.down.sql` (создать) | Откат 000009 (no-op или вернуть старый JSON — см. задачу). |
| CPLANE docs | `SKIF-CPLANE/backend/json/supervisor_experiment.example.json` | Синхрон с фрагментом шаблона демо. |
| CPLANE tests | `SKIF-CPLANE/backend/internal/pkg/supervisor/request_from_complete_info_test.go` (создать) | Регрессия: без прежних ключей параметры обогащаются. |
| Supervisor | `skif_platform_supervisor/development/supervisor/models/model_01/test.py` | Маппинг `energy_keV` → `E_input`, остальная формула без изменений. |
| Референс | `SKIF-CPLANE/docs/superpowers/specs/2026-05-06-demo-stand-e2e-supervisor-design.md` | Источник требований. |

**Не трогать без новой спеки:** `HardcodedModelProvider.java`, `model_02` (кроме косвенной проверки цепочки), `docker-compose.yml` (уже содержит `java-supervisor` и `clients.supervisor.base_url` в `backend/config.local.yaml`).

---

### Task 1: Регрессионный тест обогащения датасетами (Go)

**Files:**
- Create: `SKIF-CPLANE/backend/internal/pkg/supervisor/request_from_complete_info_test.go`

- [ ] **Step 1: Добавить тестовый файл**

Содержимое целиком:

```go
package supervisor

import (
	"encoding/json"
	"testing"

	"github.com/jackc/pgx/v5/pgtype"
	dbcore "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/db/core"
)

func TestRequestFromCompleteInfo_enrichesInputDatasetsWhenParametersEmpty(t *testing.T) {
	tmpl := `{
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
    }
  ]
}`
	datasets := []byte(`[
  {
    "alias": "beam_input",
    "id": 1,
    "name": "Демо — параметры пучка",
    "type": "json",
    "managed": false,
    "params": {"energy_keV": 12.5, "station": "ID12"},
    "schema": {}
  }
]`)
	row := dbcore.CompleteExperimentInfoRow{
		ExperimentID:     42,
		ExperimentName:   "x",
		ExperimentConfig: pgtype.Text{String: tmpl, Valid: true},
		Datasets:         datasets,
	}
	req, err := RequestFromCompleteInfo(nil, &row)
	if err != nil {
		t.Fatalf("RequestFromCompleteInfo: %v", err)
	}
	if len(req.Models) != 1 {
		t.Fatalf("models: got %d", len(req.Models))
	}
	raw, ok := req.Models[0].Parameters["input_datasets"]
	if !ok {
		t.Fatal("expected input_datasets in parameters")
	}
	b, _ := json.Marshal(raw)
	var arr []map[string]interface{}
	if err := json.Unmarshal(b, &arr); err != nil {
		t.Fatalf("unmarshal input_datasets: %v", err)
	}
	if len(arr) != 1 {
		t.Fatalf("input_datasets len: %d", len(arr))
	}
	params, _ := arr[0]["params"].(map[string]interface{})
	if params == nil {
		t.Fatal("expected params on first input dataset")
	}
	if params["energy_keV"] != 12.5 {
		t.Fatalf("energy_keV: got %v", params["energy_keV"])
	}
}

func TestRequestFromCompleteInfo_doesNotReplacePresetInputDatasetsStrings(t *testing.T) {
	tmpl := `{
  "experimentName": "demo-two-step-pipeline",
  "models": [
    {
      "modelId": "m1",
      "name": "python-preprocess",
      "order": 1,
      "language": "PYTHON",
      "modelPath": "model_01",
      "parameters": { "input_datasets": ["beam_input"] }
    }
  ]
}`
	row := dbcore.CompleteExperimentInfoRow{
		ExperimentID:     42,
		ExperimentName:   "x",
		ExperimentConfig: pgtype.Text{String: tmpl, Valid: true},
		Datasets:         []byte(`[{"alias":"beam_input","id":1,"params":{"energy_keV":99}}]`),
	}
	req, err := RequestFromCompleteInfo(nil, &row)
	if err != nil {
		t.Fatalf("RequestFromCompleteInfo: %v", err)
	}
	raw := req.Models[0].Parameters["input_datasets"]
	b, _ := json.Marshal(raw)
	if string(b) != `["beam_input"]` {
		t.Fatalf("expected string slice preserved, got %s", string(b))
	}
}
```

- [ ] **Step 2: Запустить тесты пакета**

Команда (из корня `SKIF-CPLANE/backend`):

```bash
go test ./internal/pkg/supervisor/... -count=1 -v
```

Ожидаемо: **PASS** на обоих тестах (второй фиксирует текущий контракт «строки в шаблоне блокируют обогащение»).

- [ ] **Step 3: Коммит**

```bash
cd /path/to/SKIF-CPLANE
git add backend/internal/pkg/supervisor/request_from_complete_info_test.go
git commit -m "test(supervisor): cover dataset enrichment when template parameters empty"
```

---

### Task 2: Правка сида `000008` (шаблон без блокирующих `parameters`)

**Files:**
- Modify: `SKIF-CPLANE/backend/migrations/up/000008_demo_stand_seed.up.sql` (блок `$demo_cfg$` … `$demo_cfg$`)

- [ ] **Step 1: Заменить JSON внутри heredoc** на фрагмент ниже (остальной SQL файла не менять).

```json
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
```

- [ ] **Step 2: Коммит**

```bash
git add backend/migrations/up/000008_demo_stand_seed.up.sql
git commit -m "fix(migrations): demo 000008 template allows CPLANE dataset enrichment"
```

Примечание (**karpathy:** не раздувать): свежая БД после `migrate up` должна содержать обновлённый конфиг автоматически.

---

### Task 3: Синхрон `supervisor_experiment.example.json`

**Files:**
- Modify: `SKIF-CPLANE/backend/json/supervisor_experiment.example.json`

- [ ] **Step 1: Заменить содержимое файла целиком** на это (совпадает с шагом моделей в Task 2, с человекочитаемыми `description`):

```json
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
      "description": "Предобработка входных данных (читает energy_keV из input_datasets после обогащения CPLANE)",
      "parameters": {}
    },
    {
      "modelId": "m2",
      "name": "c-simulation",
      "order": 2,
      "version": "1.0",
      "language": "C",
      "modelPath": "model_02",
      "description": "Симуляция (C), второй шаг цепочки",
      "parameters": {}
    }
  ]
}
```

- [ ] **Step 2: Коммит**

```bash
git add backend/json/supervisor_experiment.example.json
git commit -m "docs: sync supervisor experiment example with demo 000008"
```

---

### Task 4: `model_01` — использовать `energy_keV` из start.json

**Files:**
- Modify: `skif_platform_supervisor/development/supervisor/models/model_01/test.py`

- [ ] **Step 1: Заменить `test.py` целиком** на минимальный скрипт:

```python
import json


def energy_kev_from_payload(data):
    """Берём energy_keV из обогащённых CPLANE input_datasets / datasets; иначе None."""
    for key in ("input_datasets", "datasets"):
        arr = data.get(key)
        if not isinstance(arr, list):
            continue
        for item in arr:
            if not isinstance(item, dict):
                continue
            params = item.get("params")
            if isinstance(params, dict) and "energy_keV" in params:
                try:
                    return float(params["energy_keV"])
                except (TypeError, ValueError):
                    continue
    return None


with open("/input/start.json", "r") as file:
    data = json.load(file)

ek = energy_kev_from_payload(data)

E_input = float(data["E_input"]) if ek is None else ek
h_y_1 = float(data["h_y_1"])
h_y_2 = float(data["h_y_2"])
h_x_1 = float(data["h_x_1"])
h_x_2 = float(data["h_x_2"])

E_output = E_input * (1 - (h_y_1 + h_y_2 + h_x_1 + h_x_2) / 3.3)

output_data = {"E_start": E_output, "E_end": E_output}

with open("/output/end.json", "w") as file:
    json.dump(output_data, file, indent=2)
```

- [ ] **Step 2: Коммит** (в репозитории супервизора)

```bash
cd /path/to/skif_platform_supervisor
git add development/supervisor/models/model_01/test.py
git commit -m "feat(demo): model_01 uses energy_keV from CPLANE-enriched start.json"
```

Проверка успеха: локально при известном `energy_keV` в датасете и дефолтных `h_*` значение `E_output` меняется относительно сценария только с `E_input` из `HardcodedModelProvider` (130).

---

### Task 5 (опционально, brownfield): миграция `000009` для уже применённого `000008`

Выполнять **только** если на стенде уже есть `demo-stand-skif` со **старым** JSON (строковые `input_datasets`). На зелёной БД достаточно Task 2.

**Files:**
- Create: `SKIF-CPLANE/backend/migrations/up/000009_demo_stand_template_supervisor_fixup.up.sql`
- Create: `SKIF-CPLANE/backend/migrations/down/000009_demo_stand_template_supervisor_fixup.down.sql`

- [ ] **Step 1: Создать `up`**

```sql
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
```

- [ ] **Step 2: Создать `down` как no-op** (восстановление прежнего JSON небезопасно без хранения копии; для демо достаточно явного `migrate down` всего 000008 в dev).

```sql
-- Откат намеренно no-op: предыдущий JSON шаблона не сохранялся.
SELECT 1;
```

- [ ] **Step 3: Коммит**

```bash
git add backend/migrations/up/000009_demo_stand_template_supervisor_fixup.up.sql \
        backend/migrations/down/000009_demo_stand_template_supervisor_fixup.down.sql
git commit -m "fix(migrations): 000009 patch demo template for supervisor enrichment"
```

---

### Task 6: Ручная приёмка E2E

- [ ] **Step 1: Поднять стек из корня `SKIF-CPLANE`** (родительская папка с `skif_platform_supervisor` рядом, как в `docker-compose.yml`).

```bash
cd /path/to/SKIF-CPLANE
export SUPERVISOR_HOST_WORKDIR=/tmp/supervisor-work
mkdir -p "$SUPERVISOR_HOST_WORKDIR"
docker compose up --build -d
```

Ожидаемо: контейнеры `postgres`, `rabbitmq`, `backend`, `java-supervisor`, `nginx` в состоянии healthy / running.

- [ ] **Step 2: Миграции** (способ зависит от проекта Makefile / прямой `migrate`; типичный вызов из `backend`)

```bash
cd /path/to/SKIF-CPLANE/backend
# если есть migrate CLI с DSN совпадающим с compose:
migrate -path migrations/up -database "postgres://frontend_cplane:1234@localhost:5432/frontend_cplane?sslmode=disable" up
```

Ожидаемо: миграции до `000008` (и `000009` при brownfield) без ошибки.

- [ ] **Step 3: В UI CPLANE** (через nginx `http://localhost:8080` или как у вас настроено): неймспейс **`demo-stand-skif`** → эксперимент демо → **применить конфиг и запуск** (или ваш стандартный сценарий).

- [ ] **Step 4: Статус супервизора** (pod id = orch_id эксперимента после назначения, часто строка вида числового experiment id backend).

```bash
curl -sS "http://localhost:8081/api/experiments/1/status" | head -c 800
```

Ожидаемо: HTTP 200, в теле JSON поля `status`, `modelStatuses` с прохождением двух моделей (точные значения — как в ответе супервизора).

- [ ] **Step 5: Проверить влияние датасета:** в UI изменить **`energy_keV`** у входного датасета `beam_input`, снова запустить пайплайн и убедиться по логам `java-supervisor` или по производным `E_start`/`E_end`, что первый шаг реагирует (без записи фейкового статуса в БД).

---

## Self-review против спеки

**1. Spec coverage**

| Требование спеки | Задачи |
|------------------|--------|
| Убрать блокирующие `input_datasets` из шаблона | Task 2, опц. Task 5 |
| Несколько моделей, RabbitMQ, Docker | без кода — Task 6 + существующий compose |
| Вход датасетов в payload супервизора | Task 1 (тест) + Task 2 |
| `model_01` читает параметры CPLANE | Task 4 |
| Нет фиктивных статусов в БД | не добавляются новые сиды статусов |
| Результат = статус/стадии HTTP | Task 6 step 4 |
| `t_experiment_io` вне scope | не включено |

**2. Placeholder scan:** секций «TBD», пустых TODO в плане нет.

**3. Консистентность:** имена моделей `/ modelPath`, `experimentName`, алиасы `beam_input` / `detector_output` согласованы с текущей миграцией `000008` (связи `t_experiment_dataset` без изменений).

---

**План сохранён в:** `SKIF-CPLANE/docs/superpowers/plans/2026-05-06-demo-stand-e2e-supervisor.md`.

Два варианта выполнения:

1. **Subagent-Driven (рекомендуется)** — отдельный агент на каждую задачу с ревью между задачами.  
2. **Inline Execution** — выполнять задачи в этой же сессии по чеклисту с контрольными точками.

Какой вариант использовать?
