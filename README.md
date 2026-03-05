# Запуск тестового окружения

### 1. Установка swagger 
``` bash
make setup
```

### 2. Генерация документации
``` bash
make swagger
make swagger-client
```

### 4. Сборка тестового окружения в контейнерах
``` bash
make test-all
```
Из папки tests
``` bash
docker-compose up
```

# Генерация кода для репозиториев (sqlc)

### 1. Новый SQL запрос
Добавить sql запросы по пути /internal/db/queries

### 2. Описать название генерируемой функции
Пример:
```sql
-- name: InsertProjectUpdateLog :exec
INSERT INTO t_project_update_log (namespace_id, project_id, username, act, details)
VALUES ($1, $2, $3, $4, $5);
```

### 3. Сгенерировать код для новых запросов
``` bash
make sqlgen
```

# Создание новых миграций
Используется инструкция в make. Будут сгенерированы два файла в директориях migrations/up\down
``` bash
make new_migrate NAME=<имя миграции>
```

# Тестирование

### 1. Запуск тестов в контейнерах
``` bash
make test-end2end
```

**не забывать чистить папку pgdata в tests/**