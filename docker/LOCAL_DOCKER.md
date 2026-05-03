# Локальный запуск в Docker (frontend + backend + nginx)

## Что поднимается

- `nginx` на `http://localhost:8080` (отдает frontend и проксирует API).
- `backend` (cplane) с локальной авторизацией.
- `postgres` для backend.
- Внешний API-префикс: `/frontend-cplane`.

## Локальная авторизация

Логин/пароль по умолчанию:

- `admin`
- `admin`

Настройка находится в `cplane/backend/config.local.yaml` в секции `local_auth`.

## Запуск

```bash
docker compose up --build
```

После запуска открой:

`http://localhost:8080`

## Демо-данные (полная связка в UI)

После старта backend накатываются SQL-миграции. Миграция **`000008_demo_stand_seed`** создаёт неймспейс **`demo-stand-skif`**, проект **«Демо-проект оптической цепочки»**, два датасета с JSON-параметрами и эксперимент с конфигом для Java-супервизора (массив `models`). Подробности: [`docs/guides/demo-stand.md`](../docs/guides/demo-stand.md).

Чтобы проверить запуск пайплайна end-to-end, поднимите также **`rabbitmq`** и **`java-supervisor`** из того же `docker-compose.yml` (репозиторий `skif_platform_supervisor` должен лежать рядом, см. комментарии в compose-файле).

## Важно

Сборка backend тянет публичные модули через `proxy.golang.org` (GitHub и зеркала).  
Пакет `libs/models` подключается из каталога `backend/local/libs/models` (`replace` в `go.mod`), отдельный `.netrc` не нужен.
