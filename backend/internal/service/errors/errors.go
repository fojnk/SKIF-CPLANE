package errors

import (
	"fmt"
	"net/http"
)

// ServiceError - базовый тип для всех ошибок сервисного слоя
type ServiceError struct {
	Type       ErrorType
	EntityType EntityType
	Message    string
	Err        error
}

// ErrorType - тип ошибки, который определяет HTTP статус код
type ErrorType int

const (
	ErrorTypeNotFound ErrorType = iota
	ErrorTypeBadRequest
	ErrorTypeUnauthorized
	ErrorTypeForbidden
	ErrorTypeConflict
	ErrorTypeInternal
	ErrorTypeServiceUnavailable
	ErrorTypeUnprocessableEntity
)

// Константы сообщений об ошибках
const (
	ErrMsgConfigApplyBlockedByBanner = "Применение конфигурации заблокировано активным баннером"
)

// EntityType - тип сущности для детализированных сообщений об ошибках
type EntityType string

const (
	EntityExperiment         EntityType = "experiment"
	EntityDataset       EntityType = "dataset"
	EntityProject          EntityType = "project"
	EntityNamespace        EntityType = "namespace"
	EntityExperimentVariable EntityType = "experiment_variable"
	EntityProjectConfig    EntityType = "project_config"
	EntityNamespaceConfig  EntityType = "namespace_config"
	EntityUser             EntityType = "user"
	EntityUserGroup        EntityType = "user_group"
	EntityRole             EntityType = "role"
	EntityRule             EntityType = "rule"
	EntityUpdateLog        EntityType = "update_log"
	EntityVersion          EntityType = "version"
	EntityAppBanner        EntityType = "app_banner"
	EntityAppUpdate        EntityType = "app_update"
	EntityAppUpcoming      EntityType = "app_upcoming"
	EntityAppAbout         EntityType = "app_about"
	EntityRobot            EntityType = "robot"
	EntityACL              EntityType = "acl"
	EntityOrchestrator     EntityType = "orchestrator"
	EntityGeneric          EntityType = "generic"
	EntityCube EntityType = "cube"
)

// ExternalMessageError представляет локализованное сообщение об ошибке
type ExternalMessageError struct {
	Ru string `json:"ru"`
	En string `json:"en"`
}

func (e *ServiceError) Error() string {
	if e.Err != nil {
		return fmt.Sprintf("[%s] %s: %v", e.EntityType, e.Message, e.Err)
	}
	return fmt.Sprintf("[%s] %s", e.EntityType, e.Message)
}

func (e *ServiceError) Unwrap() error {
	return e.Err
}

// WithEntity устанавливает тип сущности для ошибки (для обратной совместимости)
func (e *ServiceError) WithEntity(entityType EntityType) *ServiceError {
	e.EntityType = entityType
	return e
}

// GetHTTPStatusCode возвращает HTTP статус код на основе типа ошибки
func (e *ServiceError) GetHTTPStatusCode() int {
	switch e.Type {
	case ErrorTypeNotFound:
		return http.StatusNotFound
	case ErrorTypeBadRequest:
		return http.StatusBadRequest
	case ErrorTypeUnauthorized:
		return http.StatusUnauthorized
	case ErrorTypeForbidden:
		return http.StatusForbidden
	case ErrorTypeConflict:
		return http.StatusConflict
	case ErrorTypeServiceUnavailable:
		return http.StatusServiceUnavailable
	case ErrorTypeUnprocessableEntity:
		return http.StatusUnprocessableEntity
	case ErrorTypeInternal:
		fallthrough
	default:
		return http.StatusInternalServerError
	}
}

// Конструкторы для различных типов ошибок

func NewNotFoundError(message string, err error) *ServiceError {
	return &ServiceError{
		Type:       ErrorTypeNotFound,
		EntityType: EntityGeneric,
		Message:    message,
		Err:        err,
	}
}

func NewBadRequestError(message string, err error) *ServiceError {
	return &ServiceError{
		Type:       ErrorTypeBadRequest,
		EntityType: EntityGeneric,
		Message:    message,
		Err:        err,
	}
}

func NewUnauthorizedError(message string, err error) *ServiceError {
	return &ServiceError{
		Type:       ErrorTypeUnauthorized,
		EntityType: EntityGeneric,
		Message:    message,
		Err:        err,
	}
}

func NewForbiddenError(message string, err error) *ServiceError {
	return &ServiceError{
		Type:       ErrorTypeForbidden,
		EntityType: EntityGeneric,
		Message:    message,
		Err:        err,
	}
}

func NewConflictError(message string, err error) *ServiceError {
	return &ServiceError{
		Type:       ErrorTypeConflict,
		EntityType: EntityGeneric,
		Message:    message,
		Err:        err,
	}
}

func NewInternalError(message string, err error) *ServiceError {
	return &ServiceError{
		Type:       ErrorTypeInternal,
		EntityType: EntityGeneric,
		Message:    message,
		Err:        err,
	}
}

func NewServiceUnavailableError(message string, err error) *ServiceError {
	return &ServiceError{
		Type:       ErrorTypeServiceUnavailable,
		EntityType: EntityGeneric,
		Message:    message,
		Err:        err,
	}
}

func NewUnprocessableEntityError(message string, err error) *ServiceError {
	return &ServiceError{
		Type:       ErrorTypeUnprocessableEntity,
		EntityType: EntityGeneric,
		Message:    message,
		Err:        err,
	}
}

// Конструкторы с указанием типа сущности

func NewEntityNotFoundError(entityType EntityType, err error) *ServiceError {
	message := fmt.Sprintf("%s не найден", entityType)
	return &ServiceError{
		Type:       ErrorTypeNotFound,
		EntityType: entityType,
		Message:    message,
		Err:        err,
	}
}

func NewEntityConflictError(entityType EntityType, message string, err error) *ServiceError {
	return &ServiceError{
		Type:       ErrorTypeConflict,
		EntityType: entityType,
		Message:    message,
		Err:        err,
	}
}

func NewEntityForbiddenError(entityType EntityType, message string, err error) *ServiceError {
	return &ServiceError{
		Type:       ErrorTypeForbidden,
		EntityType: entityType,
		Message:    message,
		Err:        err,
	}
}

func NewEntityInternalError(entityType EntityType, message string, err error) *ServiceError {
	return &ServiceError{
		Type:       ErrorTypeInternal,
		EntityType: entityType,
		Message:    message,
		Err:        err,
	}
}

func NewEntityBadRequestError(entityType EntityType, message string, err error) *ServiceError {
	return &ServiceError{
		Type:       ErrorTypeBadRequest,
		EntityType: entityType,
		Message:    message,
		Err:        err,
	}
}

// GetHTTPStatusCode возвращает HTTP статус код для любой ошибки
// Если это ServiceError, возвращает соответствующий код, иначе 500
func GetHTTPStatusCode(err error) int {
	if err == nil {
		return http.StatusOK
	}

	if serviceErr, ok := err.(*ServiceError); ok {
		return serviceErr.GetHTTPStatusCode()
	}

	return http.StatusInternalServerError
}

func IsNotFoundError(err error) bool {
	if serviceErr, ok := err.(*ServiceError); ok {
		return serviceErr.Type == ErrorTypeNotFound
	}
	return false
}

func IsForbiddenError(err error) bool {
	if serviceErr, ok := err.(*ServiceError); ok {
		return serviceErr.Type == ErrorTypeForbidden
	}
	return false
}

func IsUnauthorizedError(err error) bool {
	if serviceErr, ok := err.(*ServiceError); ok {
		return serviceErr.Type == ErrorTypeUnauthorized
	}
	return false
}

func IsBadRequestError(err error) bool {
	if serviceErr, ok := err.(*ServiceError); ok {
		return serviceErr.Type == ErrorTypeBadRequest
	}
	return false
}

func IsConflictError(err error) bool {
	if serviceErr, ok := err.(*ServiceError); ok {
		return serviceErr.Type == ErrorTypeConflict
	}
	return false
}

func IsServiceUnavailableError(err error) bool {
	if serviceErr, ok := err.(*ServiceError); ok {
		return serviceErr.Type == ErrorTypeServiceUnavailable
	}
	return false
}

// Детализированные сообщения об ошибках для разных сущностей
type EntityErrorMessages struct {
	NotFound    string
	Exists      string
	Forbidden   string
	BadRequest  string
	Internal    string
	Unavailable string
}

var EntityMessages = map[EntityType]EntityErrorMessages{
	EntityExperiment: {
		NotFound:    "Пайплайн не найден",
		Exists:      "Пайплайн с таким именем уже существует",
		Forbidden:   "У вас нет прав для работы с этим пайплайном",
		BadRequest:  "Некорректные данные пайплайна",
		Internal:    "Внутренняя ошибка при работе с пайплайном",
		Unavailable: "Сервис пайплайнов временно недоступен",
	},
	EntityDataset: {
		NotFound:    "Источник данных не найден",
		Exists:      "Источник данных с такими параметрами уже существует",
		Forbidden:   "У вас нет прав для работы с этим источником данных",
		BadRequest:  "Некорректные параметры источника данных",
		Internal:    "Внутренняя ошибка при работе с источником данных",
		Unavailable: "Сервис источников данных временно недоступен",
	},
	EntityProject: {
		NotFound:    "Проект не найден",
		Exists:      "Проект с таким именем уже существует",
		Forbidden:   "У вас нет прав для работы с этим проектом",
		BadRequest:  "Некорректные данные проекта",
		Internal:    "Внутренняя ошибка при работе с проектом",
		Unavailable: "Сервис проектов временно недоступен",
	},
	EntityNamespace: {
		NotFound:    "Рабочее пространство не найдено",
		Exists:      "Рабочее пространство с таким именем уже существует",
		Forbidden:   "У вас нет прав для работы с этим рабочим пространством",
		BadRequest:  "Некорректное имя рабочего пространства",
		Internal:    "Внутренняя ошибка при работе с рабочим пространством",
		Unavailable: "Сервис рабочих пространств временно недоступен",
	},
	EntityExperimentVariable: {
		NotFound:    "Переменная пайплайна не найдена",
		Exists:      "Переменная с таким именем уже существует",
		Forbidden:   "У вас нет прав для работы с этой переменной",
		BadRequest:  "Некорректные данные переменной",
		Internal:    "Внутренняя ошибка при работе с переменной пайплайна",
		Unavailable: "Сервис переменных временно недоступен",
	},
	EntityProjectConfig: {
		NotFound:    "Конфигурация проекта не найдена",
		Exists:      "Такая конфигурация уже существует",
		Forbidden:   "У вас нет прав для работы с конфигурацией проекта",
		BadRequest:  "Некорректная конфигурация проекта",
		Internal:    "Внутренняя ошибка при работе с конфигурацией проекта",
		Unavailable: "Сервис конфигураций временно недоступен",
	},
	EntityNamespaceConfig: {
		NotFound:    "Конфигурация рабочего пространства не найдена",
		Exists:      "Такая конфигурация уже существует",
		Forbidden:   "У вас нет прав для работы с конфигурацией",
		BadRequest:  "Некорректная конфигурация рабочего пространства",
		Internal:    "Внутренняя ошибка при работе с конфигурацией",
		Unavailable: "Сервис конфигураций временно недоступен",
	},
	EntityUser: {
		NotFound:    "Пользователь не найден",
		Exists:      "Пользователь уже существует",
		Forbidden:   "У вас нет прав для работы с этим пользователем",
		BadRequest:  "Некорректные данные пользователя",
		Internal:    "Внутренняя ошибка при работе с пользователем",
		Unavailable: "Сервис пользователей временно недоступен",
	},
	EntityUserGroup: {
		NotFound:    "Группа пользователей не найдена",
		Exists:      "Группа с таким именем уже существует",
		Forbidden:   "У вас нет прав для работы с этой группой",
		BadRequest:  "Некорректные данные группы",
		Internal:    "Внутренняя ошибка при работе с группой пользователей",
		Unavailable: "Сервис групп временно недоступен",
	},
	EntityRole: {
		NotFound:    "Роль не найдена",
		Exists:      "Роль с таким именем уже существует",
		Forbidden:   "У вас нет прав для работы с этой ролью",
		BadRequest:  "Некорректные данные роли",
		Internal:    "Внутренняя ошибка при работе с ролью",
		Unavailable: "Сервис ролей временно недоступен",
	},
	EntityRule: {
		NotFound:    "Правило не найдено",
		Exists:      "Такое правило уже существует",
		Forbidden:   "У вас нет прав для работы с этим правилом",
		BadRequest:  "Некорректные данные правила",
		Internal:    "Внутренняя ошибка при работе с правилом",
		Unavailable: "Сервис правил временно недоступен",
	},
	EntityUpdateLog: {
		NotFound:    "Лог обновления не найден",
		Exists:      "Такой лог уже существует",
		Forbidden:   "У вас нет прав для работы с этим логом",
		BadRequest:  "Некорректные данные лога",
		Internal:    "Внутренняя ошибка при работе с логом обновлений",
		Unavailable: "Сервис логов временно недоступен",
	},
	EntityVersion: {
		NotFound:    "Версия не найдена",
		Exists:      "Такая версия уже существует",
		Forbidden:   "У вас нет прав для работы с этой версией",
		BadRequest:  "Некорректные данные версии",
		Internal:    "Внутренняя ошибка при работе с версией",
		Unavailable: "Сервис версий временно недоступен",
	},
	EntityAppBanner: {
		NotFound:    "Баннер приложения не найден",
		Exists:      "Баннер с таким именем уже существует",
		Forbidden:   "У вас нет прав для работы с баннерами",
		BadRequest:  "Некорректные данные баннера",
		Internal:    "Внутренняя ошибка при работе с баннером",
		Unavailable: "Сервис баннеров временно недоступен",
	},
	EntityAppUpdate: {
		NotFound:    "Обновление приложения не найдено",
		Exists:      "Обновление с такими параметрами уже существует",
		Forbidden:   "У вас нет прав для работы с обновлениями приложения",
		BadRequest:  "Некорректные данные обновления",
		Internal:    "Внутренняя ошибка при работе с обновлениями приложения",
		Unavailable: "Сервис обновлений приложения временно недоступен",
	},
	EntityAppUpcoming: {
		NotFound:    "Upcoming контент не найден",
		Exists:      "Upcoming контент уже существует",
		Forbidden:   "У вас нет прав для работы с upcoming контентом",
		BadRequest:  "Некорректные данные upcoming контента",
		Internal:    "Внутренняя ошибка при работе с upcoming контентом",
		Unavailable: "Сервис upcoming временно недоступен",
	},
	EntityAppAbout: {
		NotFound:    "About контент не найден",
		Exists:      "About контент уже существует",
		Forbidden:   "У вас нет прав для работы с about контентом",
		BadRequest:  "Некорректные данные about контента",
		Internal:    "Внутренняя ошибка при работе с about контентом",
		Unavailable: "Сервис about временно недоступен",
	},
	EntityRobot: {
		NotFound:    "Робот не найден",
		Exists:      "Робот с таким именем уже существует",
		Forbidden:   "У вас нет прав для работы с этим роботом",
		BadRequest:  "Некорректные данные робота",
		Internal:    "Внутренняя ошибка при работе с роботом",
		Unavailable: "Сервис роботов временно недоступен",
	},
	EntityACL: {
		NotFound:    "Права доступа не найдены",
		Exists:      "Такие права уже существуют",
		Forbidden:   "У вас нет прав для управления правами доступа",
		BadRequest:  "Некорректные данные прав доступа",
		Internal:    "Внутренняя ошибка при работе с правами доступа",
		Unavailable: "Сервис прав доступа временно недоступен",
	},
	EntityOrchestrator: {
		NotFound:    "Ресурс оркестратора не найден",
		Exists:      "Ресурс уже существует в оркестраторе",
		Forbidden:   "Доступ к оркестратору запрещен",
		BadRequest:  "Некорректный запрос к оркестратору",
		Internal:    "Внутренняя ошибка оркестратора",
		Unavailable: "Оркестратор временно недоступен",
	},
	EntityGeneric: {
		NotFound:    "Ресурс не найден",
		Exists:      "Ресурс уже существует",
		Forbidden:   "Доступ запрещен",
		BadRequest:  "Некорректный запрос",
		Internal:    "Внутренняя ошибка сервера",
		Unavailable: "Сервис временно недоступен",
	},
	EntityCube: {
		NotFound:    "Куб не найден",
		Exists:      "Куб с таким именем уже существует",
		Forbidden:   "У вас нет прав для работы с кубом",
		BadRequest:  "Некорректные данные куба",
		Internal:    "Внутренняя ошибка при работе с кубами",
		Unavailable: "Сервис кубов временно недоступен",
	},
}

// GetDetailedMessage возвращает детализированное сообщение об ошибке на основе типа сущности
func (e *ServiceError) GetDetailedMessage() string {
	if e.Message != "" {
		return e.Message
	}

	messages, ok := EntityMessages[e.EntityType]
	if !ok {
		messages = EntityMessages[EntityGeneric]
	}

	switch e.Type {
	case ErrorTypeNotFound:
		return messages.NotFound
	case ErrorTypeConflict:
		return messages.Exists
	case ErrorTypeForbidden:
		return messages.Forbidden
	case ErrorTypeBadRequest:
		return messages.BadRequest
	case ErrorTypeServiceUnavailable:
		return messages.Unavailable
	default:
		return messages.Internal
	}
}
