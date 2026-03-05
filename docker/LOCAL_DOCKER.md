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

Сборка backend использует зависимости из приватного GitLab (`gitlab.corp.mail.ru`).  
Если у вашей машины нет доступа к этим зависимостям, сборка backend не пройдет — тогда нужно настроить доступ к приватным Go-модулям (например, через `.netrc`/корпоративный proxy).
