# Контур управления экспериментом (control loop)

Кратко: CPLANE **не исполняет** пайплайн; он отправляет команды в **RabbitMQ**, опционально читает **HTTP-статус** у Java-супервизора и сохраняет метаданные в PostgreSQL. Транспорт, форматы сообщений и конфигурация клиентов — в [supervisor-architecture.md](supervisor-architecture.md).

## Назначение

Описать сквозной сценарий: **запуск**, **остановка**, **применение конфигурации**, **получение статуса** и **обогащение списка задач** живыми данными супервизора и глубиной очереди.

## Связь с другими сущностями

- Эксперимент хранится в CPLANE ([`entities/experiment.md`](../entities/experiment.md)); поле **`orch_id`** связывает запись с рантаймом супервизора.
- Датасеты и переменные попадают в собранный JSON перед публикацией в брокер.

```mermaid
sequenceDiagram
  participant UI as ControlPlaneUI
  participant API as CPLANE_API
  participant Svc as ExperimentActionsService
  participant RMQ as RabbitMQ
  participant Sup as JavaSupervisor

  UI->>API: PUT /api/v1/experiment/start
  API->>Svc: StartExperiment
  Svc->>Svc: RequestFromCompleteInfo plus supervisorenrich
  Svc->>RMQ: PublishExperimentStart (experiment.start)
  RMQ->>Sup: message delivery

  UI->>API: GET /api/v1/experiment/status
  API->>Svc: GetExperimentStatus(orch_id)
  Svc->>Sup: GET /api/experiments/id/status
  Sup-->>Svc: WireExperimentStatus
  Svc-->>API: ExperimentStatusResponse plus SupervisorExperimentRun
```

## Модель данных

Для контура важны:

- [`t_experiment`](../database/cplane.dbml#L199-L208) — `status`, **`orch_id`** (строка; для HTTP должен парситься в положительный int64).
- [`t_experiment_status`](../database/cplane.dbml#L255-L265) — применённая версия и снимок конфига после **apply** (`InsertExperimentAppliedVersion` в SQL-слое).

Полная схема — [`database/cplane.dbml`](../database/cplane.dbml).

## HTTP API (операции контура)

Регистрация маршрутов: [`backend/internal/handlers/private/handlers.go`](../../backend/internal/handlers/private/handlers.go).

| Метод | Путь | Назначение | Handler |
|-------|------|------------|---------|
| PUT | `/api/v1/experiment/start` | Запуск пайплайна (публикация в RabbitMQ) | [`experiment_actions.go`](../../backend/internal/handlers/private/experiment_actions.go) `ExperimentStartHandler` |
| PUT | `/api/v1/experiment/stop` | Остановка | `ExperimentStopHandler` |
| GET | `/api/v1/experiment/status` | Статус (HTTP к супервизору при настроенном `base_url`) | `ExperimentStatusHandler` |
| PUT | `/api/v1/experiment/config/apply` | Применить конфиг (публикация `experiment.apply`, обновление `t_experiment_status`) | [`apply_experiment_config.go`](../../backend/internal/handlers/private/apply_experiment_config.go) `ApplyExperimentConfigHandler` |

Подробнее о модели данных и HTTP API эксперимента — в [`entities/experiment.md`](../entities/experiment.md).

## Сервис

[`backend/internal/service/experiment/experiment_actions_service.go`](../../backend/internal/service/experiment/experiment_actions_service.go):

- **`StartExperiment`** — загрузка `CompleteExperimentInfo`, сборка `supervisor.ExperimentRequest` (`RequestFromCompleteInfo`), подстановка переменных (`supervisorenrich.ApplyExperimentVariables`), `PublishExperimentStart`.
- **`StopExperiment`** — `PublishExperimentStop` с `experiment_id` и `supervisor_experiment_id` из **`orch_id`**.
- **`ApplyExperimentConfig`** — та же сборка, что для старта → `PublishExperimentApply` → сохранение применённой версии в **`t_experiment_status`**.
- **`GetExperimentStatus`** — при пустом `clients.supervisor.base_url` возвращается заглушка со статусом `UNKNOWN`; при невалидном `orch_id` — поясняющее сообщение; иначе `supervisorstatus.Fetch` по `GET {baseURL}/api/experiments/{id}/status`.
- **`GetSupervisorExperimentID`** — чтение `orch_id` из полного снимка эксперимента.

## Сборка запроса и обогащение

| Пакет | Роль |
|-------|------|
| [`internal/pkg/supervisor`](../../backend/internal/pkg/supervisor) | `ExperimentRequest`, `RequestFromCompleteInfo`, распознавание layout супервизора |
| [`internal/pkg/supervisorenrich`](../../backend/internal/pkg/supervisorenrich) | Подстановка переменных эксперимента в JSON |
| [`internal/pkg/orch`](../../backend/internal/pkg/orch) | Конвертация из модели оркестратора, если конфиг не в layout супервизора |

## RabbitMQ

[`backend/internal/clients/rabbitmq/`](../../backend/internal/clients/rabbitmq/) — exchange (по умолчанию topic `cplane.events`), routing keys `experiment.start` / `experiment.stop` / `experiment.apply`, persistent JSON. Тела — см. [`events.go`](../../backend/internal/clients/rabbitmq/events.go).

Без включённого и успешно инициализированного клиента операции start/stop/apply завершаются ошибкой (супервизор команды не получает).

## HTTP-статус и маппинг

[`internal/pkg/supervisorstatus`](../../backend/internal/pkg/supervisorstatus) — HTTP GET к супервизору.

Агрегированный статус в DTO: **`mapJavaSupervisorStatusToDTO`** в `experiment_actions_service.go`:

| Java (супервизор) | DTO CPLANE |
|-------------------|------------|
| `QUEUED`, `RUNNING` | `PENDING` |
| `COMPLETED` | `OK` |
| `FAILED` | `ERROR` |
| `CANCELLED` | `WARNING` |
| иное / пусто | `UNKNOWN` |

Детальный ответ — **`SupervisorExperimentRun`** в [`experiment_responses.go`](../../backend/internal/entities/responses/experiment_responses.go).

## Поле `orch_id`

- **Запись при создании/копировании** эксперимента: [`UpdateExperimentOrchID`](../../backend/internal/service/experiment/experiment_service.go) (значение связано с id эксперимента в CPLANE).
- **Stop** — в сообщение уходит как `supervisor_experiment_id`.
- **Status** — в URL супервизора подставляется как числовой id; должен быть **> 0** после парсинга.

## Обогащение задач

[`backend/internal/handlers/private/experiment_jobs.go`](../../backend/internal/handlers/private/experiment_jobs.go) — функция **`applyLiveSupervisorAndQueue`**: для записей start/apply подмешивает живой статус и стадии из ответа супервизора; при настроенном RabbitMQ может добавить сведения о глубине очереди (`supervisor_queue`, passive declare).

## Поведение при отсутствии интеграций

- **Нет RabbitMQ** — start/stop/apply недоступны (ошибка на стороне API/сервиса).
- **Нет `clients.supervisor.base_url`** — детальный HTTP-статус не запрашивается; в ответе возможна заглушка про необходимость URL.

Конфигурация: [`backend/config.local.yaml`](../../backend/config.local.yaml), структуры в [`internal/config`](../../backend/internal/config).

## DTO / requests / responses

- [`experiment_responses.go`](../../backend/internal/entities/responses/experiment_responses.go) — `ExperimentStatusResponse`, `SupervisorExperimentRun`.
- Запросы старта/стопа/apply — `internal/entities/requests` (типы `ExperimentStartRequest`, …).

## Репозиторий и SQL

[`repository.go`](../../backend/internal/repository/repository.go); для apply — запросы в [`experiment_actions.sql`](../../backend/internal/db/queries/experiment_actions.sql), [`complete_experiment_info.sql`](../../backend/internal/db/queries/complete_experiment_info.sql).

## Версионирование

При **apply** обновляется **`t_experiment_status`** (текущая применённая версия и `orch_config`). Версии шаблона/переменных — см. [`entities/experiment.md`](../entities/experiment.md).

## Журнал изменений

Хендлеры start/stop/apply вызывают **`LogExperimentChange`** (см. `experiment_actions.go`, `apply_experiment_config.go`) — записи в **`t_experiment_update_log`**.

## ACL

Проверки прав на операции эксперимента выполняются в соответствующих handlers (star/stop/apply, чтение статуса). Базовый пакет: [`internal/pkg/acl`](../../backend/internal/pkg/acl).

## См. также

- [supervisor-architecture.md](supervisor-architecture.md)
- [entities/experiment.md](../entities/experiment.md)
- [docs/README.md](../README.md)
