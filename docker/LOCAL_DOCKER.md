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

## Важно

Сборка backend тянет публичные модули через `proxy.golang.org` (GitHub и зеркала).  
Пакет `libs/models` подключается из каталога `backend/local/libs/models` (`replace` в `go.mod`), отдельный `.netrc` не нужен.
