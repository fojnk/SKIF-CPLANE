# Система обработки ошибок в сервисном слое

## Описание

Этот пакет предоставляет продвинутую систему обработки ошибок для сервисного слоя приложения с типизацией сущностей и детализированными сообщениями. Система автоматически:
- Определяет HTTP статус коды
- Предоставляет детализированные сообщения для разных типов сущностей
- Обрабатывает ошибки PostgreSQL (unique violations, not found)
- Разделяет внутренние ошибки и сообщения для пользователей

## Структура ServiceError

```go
type ServiceError struct {
    Type       ErrorType   // Тип ошибки (определяет HTTP статус)
    EntityType EntityType  // Тип сущности (определяет детализированное сообщение)
    Message    string      // Кастомное сообщение (опционально)
    Err        error       // Внутренняя ошибка для логирования
}
```

## Типы ошибок и их HTTP статусы

| ErrorType | HTTP Status | Использование |
|-----------|-------------|---------------|
| ErrorTypeNotFound | 404 | Ресурс не найден |
| ErrorTypeBadRequest | 400 | Некорректные входные данные |
| ErrorTypeUnauthorized | 401 | Требуется авторизация |
| ErrorTypeForbidden | 403 | Доступ запрещен |
| ErrorTypeConflict | 409 | Конфликт (например, дубликат) |
| ErrorTypeInternal | 500 | Внутренняя ошибка сервера |
| ErrorTypeServiceUnavailable | 503 | Сервис недоступен |
| ErrorTypeUnprocessableEntity | 422 | Невозможно обработать |

## Типы сущностей (EntityType)

Доступны следующие типы сущностей с предопределенными сообщениями:
- `EntityExperiment` - пайплайны
- `EntityDataset` - источники данных
- `EntityProject` - проекты
- `EntityNamespace` - рабочие пространства
- `EntityExperimentVariable` - переменные пайплайна
- `EntityUser`, `EntityUserGroup`, `EntityRole`, `EntityRule` - управление доступом
- `EntityUpdateLog`, `EntityVersion` - версионирование
- `EntityAppBanner`, `EntityRobot` - прочие сущности
- `EntityGeneric` - для общих случаев

## Использование в сервисном слое

### Способ 1: С типом сущности (рекомендуется)

```go
import serviceerrors "gitlab.corp.mail.ru/adtech/go/streamflow/internal/service/errors"

// Автоматически использует детализированное сообщение "Пайплайн не найден"
if err == pgx.ErrNoRows {
    return nil, serviceerrors.NewEntityNotFoundError(serviceerrors.EntityExperiment, err)
}

// Кастомное сообщение для конфликта
if isDuplicate {
    return nil, serviceerrors.NewEntityConflictError(
        serviceerrors.EntityExperiment,
        "Пайплайн с таким именем уже существует в этом проекте",
        err,
    )
}

// Ошибка доступа
if !hasAccess {
    return nil, serviceerrors.NewEntityForbiddenError(
        serviceerrors.EntityExperiment,
        "У вас нет прав для редактирования этого пайплайна",
        nil,
    )
}
```

### Способ 2: Автоматическая обработка PostgreSQL ошибок

```go
// Автоматически определяет тип ошибки (NotFound, Conflict, Internal)
experiment, err := s.repo.GetExperiment(id)
if err != nil {
    return nil, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityExperiment)
}

// Или с использованием цепочки проверок
err := s.repo.CreateExperiment(data)
if err != nil {
    return serviceerrors.NewErrorChain(err, serviceerrors.EntityExperiment).
        OrPostgres() // Автоматически обрабатывает все PostgreSQL ошибки
}
```

### Способ 3: Цепочка проверок (Chain of Responsibility)

```go
err := someOperation()
if err != nil {
    return serviceerrors.NewErrorChain(err, serviceerrors.EntityProject).
        Check(func(e error) *serviceerrors.ServiceError {
            // Кастомная проверка
            if isSpecialError(e) {
                return serviceerrors.NewEntityBadRequestError(
                    serviceerrors.EntityProject,
                    "Специальная ошибка",
                    e,
                )
            }
            return nil
        }).
        OrPostgres() // Fallback на стандартную обработку PostgreSQL
}
```

### Способ 4: Обратная совместимость

```go
// Старый способ все еще работает
err := serviceerrors.NewNotFoundError("Пайплайн не найден", err)

// Можно добавить EntityType позже
err = err.WithEntity(serviceerrors.EntityExperiment)
```

## Автоматические детализированные сообщения

Для каждого типа сущности предопределены сообщения:

```go
EntityMessages[EntityExperiment] = {
    NotFound:    "Пайплайн не найден",
    Exists:      "Пайплайн с таким именем уже существует",
    Forbidden:   "У вас нет прав для работы с этим пайплайном",
    BadRequest:  "Некорректные данные пайплайна",
    Internal:    "Внутренняя ошибка при работе с пайплайном",
    Unavailable: "Сервис пайплайнов временно недоступен",
}
```

Если не указано кастомное сообщение, используется детализированное:

```go
// Автоматически использует "Пайплайн не найден"
err := serviceerrors.NewEntityNotFoundError(serviceerrors.EntityExperiment, originalErr)

// Использует кастомное сообщение
err := serviceerrors.NewEntityNotFoundError(serviceerrors.EntityExperiment, originalErr)
err.Message = "Пайплайн с ID 123 не найден"
```

## Обработка PostgreSQL ошибок

### Автоматическое определение constraint violations

```go
// Автоматически определяет:
// - UniqueNamespaceConstraint -> "Рабочее пространство с таким именем уже существует"
// - UniqueProjectConstraint -> "Проект с таким именем уже существует в этом namespace"
// - UniqueExperimentTemplateConstraint -> "Пайплайн с таким именем уже существует"
// - И другие...

err := s.repo.CreateNamespace(name)
if err != nil {
    return serviceerrors.ConvertPostgresError(err, serviceerrors.EntityNamespace)
}
```

### Хелперы для проверки PostgreSQL ошибок

```go
// Проверить нарушение уникальности
if serviceerrors.IsPostgresUniqueViolation(err) {
    constraintName := serviceerrors.GetConstraintName(err)
    // Обработать конкретный constraint
}

// Проверить "не найдено"
if serviceerrors.IsPostgresNotFound(err) {
    // Обработать
}
```

## Преобразование в HTTP ответ

### В handlers

```go
import serviceerrors "gitlab.corp.mail.ru/adtech/go/streamflow/internal/service/errors"

// Простой способ
func handler(svc *service.Service) *responses.ErrorResponse {
    result, err := svc.Experiment.GetExperiment(id)
    if err != nil {
        return serviceerrors.ToErrorResponse(err) // Автоматически использует детализированные сообщения
    }
    return result
}

// С fallback сообщением
func handler(svc *service.Service) *responses.ErrorResponse {
    result, err := svc.Experiment.GetExperiment(id)
    if err != nil {
        return serviceerrors.ToErrorResponseWithFallback(
            err,
            "Не удалось получить пайплайн",
            http.StatusInternalServerError,
        )
    }
    return result
}
```

### В handler слое уже есть convertServiceError

Функция `convertServiceError` в `handlers/private/helpers.go` и `handlers/public/helpers.go` автоматически:
- Использует детализированные сообщения из ServiceError
- Возвращает правильный HTTP статус
- Передает внутреннюю ошибку для логирования

## Полный пример

### 1. В сервисе (service/experiment/experiment_service.go):

```go
func (s *ExperimentService) GetExperiment(id int64) (*models.Experiment, error) {
    experiment, err := s.repo.SelectExperimentByID(id)
    if err != nil {
        // Автоматически:
        // - pgx.ErrNoRows -> NotFound + "Пайплайн не найден"
        // - Другие DB ошибки -> Internal + "Внутренняя ошибка при работе с пайплайном"
        return nil, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityExperiment)
    }
    return experiment, nil
}

func (s *ExperimentService) CreateExperiment(data *CreateExperimentRequest) (int64, error) {
    // Проверка прав
    if !s.acl.HasAccess(user, resource) {
        return 0, serviceerrors.NewEntityForbiddenError(
            serviceerrors.EntityExperiment,
            "У вас нет прав для создания пайплайна в этом проекте",
            nil,
        )
    }

    // Валидация
    if !isValidName(data.Name) {
        return 0, serviceerrors.NewEntityBadRequestError(
            serviceerrors.EntityExperiment,
            "Имя пайплайна должно содержать только латинские буквы и цифры",
            nil,
        )
    }

    id, err := s.repo.InsertExperiment(data)
    if err != nil {
        // Автоматически определяет unique constraint violation
        // и возвращает "Пайплайн с таким именем уже существует"
        return 0, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityExperiment)
    }

    return id, nil
}
```

### 2. В handler (handlers/private/experiment.go):

```go
func GetExperiment(svc *service.Service, r *http.Request, logger *logger.Logger, info *user.UserInfo) (any, *responses.ErrorResponse) {
    id := getIDFromURL(r)
    
    experiment, err := svc.Experiment.GetExperiment(id)
    if err != nil {
        // convertServiceError автоматически:
        // - Извлекает детализированное сообщение
        // - Определяет HTTP статус (404 для NotFound)
        // - Логирует внутреннюю ошибку
        return nil, convertServiceError(err, shared.EntityExperiment)
    }
    
    return experiment, nil
}
```

### 3. Результат для клиента:

**404 Not Found:**
```json
{
    "error": "Пайплайн не найден"
}
```

**403 Forbidden:**
```json
{
    "error": "У вас нет прав для создания пайплайна в этом проекте"
}
```

**409 Conflict:**
```json
{
    "error": "Пайплайн с таким именем уже существует"
}
```

### 4. В логах:

```
ERROR [experiment] Пайплайн не найден: sql: no rows in result set
ERROR [experiment] У вас нет прав для создания пайплайна в этом проекте
ERROR [experiment] Пайплайн с таким именем уже существует: pq: duplicate key value violates unique constraint "c_experiment_unique_name"
```

## Проверка типа ошибки

```go
if serviceerrors.IsNotFoundError(err) {
    // Обработать NotFound
}

if serviceerrors.IsForbiddenError(err) {
    // Обработать Forbidden
}

if serviceerrors.IsConflictError(err) {
    // Обработать Conflict
}

// Получить HTTP статус
statusCode := serviceerrors.GetHTTPStatusCode(err)
```

## Преимущества улучшенной системы

1. **Детализированные сообщения:** Автоматически генерируются понятные сообщения для каждой сущности
2. **Типизация сущностей:** Разные сообщения для Experiment, Project, Namespace и т.д.
3. **Автоматическая обработка БД:** ConvertPostgresError автоматически определяет NotFound, Conflict
4. **Умная обработка constraints:** Специальные сообщения для известных unique constraints
5. **Цепочка проверок:** Pattern Chain of Responsibility для сложных сценариев
6. **Обратная совместимость:** Старый код продолжает работать
7. **Консистентность:** Единообразные сообщения во всем приложении
8. **Separation of Concerns:** Внутренние детали не утекают в API

## Best Practices

1. **Используйте EntityType:** Всегда указывайте тип сущности для автоматических детализированных сообщений
2. **ConvertPostgresError для БД:** Используйте этот хелпер для всех операций с БД
3. **Кастомные сообщения когда нужно:** Добавляйте контекст (ID, имя) в сообщения
4. **Цепочки для сложных случаев:** ErrorCheckChain для множественных проверок
5. **Логируйте оригинальную ошибку:** Всегда передавайте `err` параметр для логирования
6. **Не раскрывайте детали БД:** Используйте понятные сообщения, а не SQL ошибки

## Миграция старого кода

### Было:
```go
if err != nil {
    s.repo.Logger.Error("failed to get experiment", err)
    return nil, errors.New("Не удалось получить пайплайн")
}
```

### Стало (способ 1 - простой):
```go
if err != nil {
    s.repo.Logger.Error("failed to get experiment", err)
    return nil, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityExperiment)
}
```

### Стало (способ 2 - еще проще):
```go
if err != nil {
    return nil, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityExperiment)
}
// Логирование происходит автоматически в handler слое
```

## Проброс ошибок до контроллеров

### Архитектура проброса ошибок:

```
[Service Layer]           [Handler Layer]              [HTTP Response]
    |                          |                             |
ServiceError  ---->  convertServiceError()  ---->   ErrorResponse
    |                          |                             |
    |                          |                             |
EntityType            GetDetailedMessage()         JSON {"error": "..."}
ErrorType            GetHTTPStatusCode()           HTTP Status: 404
Message              InternalError (logging)       
Err (wrapped)
```

### Схема работы:

1. **Сервисный слой** создает `ServiceError` с EntityType и ErrorType
2. **Handler слой** вызывает `convertServiceError()` или `ToErrorResponse()`
3. **Конвертер** извлекает детализированное сообщение и HTTP статус
4. **ErrorResponse** создается с правильным статусом и сообщением
5. **WrapHandler** в shared/helpers.go отправляет ErrorResponse клиенту с правильным HTTP статусом

### Пример проброса:

```go
// Service Layer
func (s *ExperimentService) GetExperiment(id int64) (*models.Experiment, error) {
    experiment, err := s.repo.SelectExperimentByID(id)
    if err != nil {
        return nil, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityExperiment)
        // Возвращает ServiceError {
        //   Type: ErrorTypeNotFound,
        //   EntityType: EntityExperiment,
        //   Message: "",
        //   Err: pgx.ErrNoRows
        // }
    }
    return experiment, nil
}

// Handler Layer
func GetExperiment(svc *service.Service, r *http.Request, ...) (any, *responses.ErrorResponse) {
    experiment, err := svc.Experiment.GetExperiment(id)
    if err != nil {
        return nil, convertServiceError(err, shared.EntityExperiment)
        // Возвращает ErrorResponse {
        //   InternalError: pgx.ErrNoRows,
        //   ExternalMessage: "Пайплайн не найден",
        //   HTTPStatusCode: 404
        // }
    }
    return experiment, nil
}

// WrapHandler в shared/helpers.go
if sErr != nil {
    logger.Error("error processing query", sErr.InternalError)  // Логирует внутреннюю ошибку
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(sErr.HTTPStatusCode)  // Устанавливает 404
    marshalError(sErr.ExternalMessage, w, logger)  // Отправляет {"error": "Пайплайн не найден"}
    return
}
```

### Итог:

Клиент получает:
```
HTTP/1.1 404 Not Found
Content-Type: application/json

{"error": "Пайплайн не найден"}
```

В логах:
```
ERROR error processing query: sql: no rows in result set
```
