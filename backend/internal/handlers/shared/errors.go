package shared

import (
	"net/http"

	xerrors "github.com/pkg/errors"

	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/responses"
	svcerrors "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service/errors"
)

var (
	UniqueConstraintViolationCode = "23505"
	FkConstraintViolationCode     = "23503"

	UniqueNamespaceConstraint        = "c_namespace_unique_name"
	UniqueUserGroupConstraint        = "c_user_group_unique_name"
	UniqueRoleConstraint             = "c_role_unique_name"
	UniqueProjectConstraint          = "c_project_unique_name"
	UniqueExperimentTemplateConstraint = "c_experiment_unique_name"
	UniqueDatasetConstraint       = "c_unique_dataset_name_in_project"
	UniqueExperimentDatasetAlias    = "c_unique_alias"
	UniqueExperimentVariableConstraint = "c_unique_variable_name"
	UniqueCubeConstraint             = "c_unique_cube_name"
)

type EntityType string

const (
	EntityExperiment             EntityType = "experiment"
	EntityDataset           EntityType = "dataset"
	EntityProject              EntityType = "project"
	EntityNamespace            EntityType = "namespace"
	EntityExperimentVariables    EntityType = "experiment_variables"
	EntityProjectVariables     EntityType = "project_variables"
	EntityNamespaceVariables   EntityType = "namespace_variables"
	EntityUser                 EntityType = "user"
	EntityUserGroup            EntityType = "user_group"
	EntityUserGroupRole        EntityType = "user_group_role"
	EntityUserGroupRule        EntityType = "user_group_rule"
	EntityUserRule             EntityType = "user_rule"
	EntityUserRole             EntityType = "user_role"
	EntityRole                 EntityType = "role"
	EntityRule                 EntityType = "rule"
	EntityUpdateLog            EntityType = "update_log"
	EntityPermissionDenied     EntityType = "permission_denied"
	EntityCompliteExperimentInfo EntityType = "complite_experiment_info"
	EntityForms                EntityType = "forms"
	EntityAppBanner            EntityType = "app_banner"
	EntityAppUpdate            EntityType = "app_update"
	EntityAppUpcoming          EntityType = "app_upcoming"
	EntityAppAbout             EntityType = "app_about"
	EntityCube EntityType = "cube"
)

// ExternalMessageError - алиас для errors.ExternalMessageError для обратной совместимости
type ExternalMessageError = svcerrors.ExternalMessageError

type ErrorType string

const (
	ErrorNotFound    ErrorType = "not_found"
	ErrorExist       ErrorType = "exists"
	PermissionDenied ErrorType = "permission_denied"
	InternalError    ErrorType = "internal_error"
)

var ErrorDetails = map[EntityType]map[ErrorType]ExternalMessageError{
	EntityExperiment: map[ErrorType]ExternalMessageError{
		ErrorNotFound:    {Ru: "Пайплайн не найден", En: "Experiment not found"},
		ErrorExist:       {Ru: "Такой пайплайн уже существует", En: "Experiment already exists"},
		PermissionDenied: {Ru: "У вас нет прав для работы с этим пайплайном", En: "Permission denied to experiment"},
		InternalError:    {Ru: "На сервере произошла ошибка при работе с пайплайном", En: "Experiment internal error"},
	},
	EntityDataset: map[ErrorType]ExternalMessageError{
		ErrorNotFound:    {Ru: "Источник данных не найден", En: "Dataset not found"},
		ErrorExist:       {Ru: "Такой источник данных уже существует", En: "Dataset already exists"},
		PermissionDenied: {Ru: "У вас нет прав для работы с этим источником данных", En: "Permission denied to dataset"},
		InternalError:    {Ru: "На сервере произошла ошибка при работе с источником данных", En: "Dataset internal error"},
	},
	EntityProject: map[ErrorType]ExternalMessageError{
		ErrorNotFound:    {Ru: "Проект не найден", En: "Project not found"},
		ErrorExist:       {Ru: "Такой проект уже существует", En: "Project already exists"},
		PermissionDenied: {Ru: "У вас нет прав для работы с этим проектом", En: "Permission denied to project"},
		InternalError:    {Ru: "На сервере произошла ошибка при работе с проектом", En: "Project internal error"},
	},
	EntityNamespace: map[ErrorType]ExternalMessageError{
		ErrorNotFound:    {Ru: "Рабочее пространство не найдено", En: "Namespace not found"},
		ErrorExist:       {Ru: "Такое пространство уже существует", En: "Namespace already exists"},
		PermissionDenied: {Ru: "У вас нет прав для работы с этим пространством", En: "Permission denied to namespace"},
		InternalError:    {Ru: "На сервере произошла ошибка при работе с пространством", En: "Namespace internal error"},
	},
	EntityProjectVariables: map[ErrorType]ExternalMessageError{
		ErrorNotFound:    {Ru: "Переменные проекта не найдены", En: "Project variables not found"},
		ErrorExist:       {Ru: "Такая переменная уже существует в проекта", En: "Project variable already exists"},
		PermissionDenied: {Ru: "У вас нет прав к переменным в этом проекте", En: "Permission denied to project variables"},
		InternalError:    {Ru: "На сервере произошла ошибка при работе с переменными проекта", En: "Project variables internal error"},
	},
	EntityNamespaceVariables: map[ErrorType]ExternalMessageError{
		ErrorNotFound:    {Ru: "Переменные пространства не найдены", En: "Namespace variables not found"},
		ErrorExist:       {Ru: "Такая переменная уже существует в рабочем пространстве", En: "Namespace variable already exists"},
		PermissionDenied: {Ru: "У вас нет прав к переменным этого рабочего пространства", En: "Permission denied to namespace variables"},
		InternalError:    {Ru: "На сервере произошла ошибка при работе с переменными рабочего пространства", En: "Namespace variables internal error"},
	},
	EntityExperimentVariables: map[ErrorType]ExternalMessageError{
		ErrorNotFound:    {Ru: "Переменные пайплайна не найдены", En: "Experiment variables not found"},
		ErrorExist:       {Ru: "Такая переменная уже существует в пайплайне", En: "Experiment variable already exists"},
		PermissionDenied: {Ru: "У вас нет прав к переменным этого пайплайна", En: "Permission denied to experiment variables"},
		InternalError:    {Ru: "На сервере произошла ошибка при работе с переменными пайплайна", En: "Experiment variables internal error"},
	},
	EntityUser: map[ErrorType]ExternalMessageError{
		ErrorNotFound:    {Ru: "Пользователь не найден", En: "User not found"},
		ErrorExist:       {Ru: "Пользователь уже существует", En: "User already exists"},
		PermissionDenied: {Ru: "У вас нет прав к этому пользователю", En: "Permission denied to user"},
		InternalError:    {Ru: "Ошибка при работе с пользователем", En: "Internal error with user"},
	},
	EntityUserGroup: map[ErrorType]ExternalMessageError{
		ErrorNotFound:    {Ru: "Группа пользователей не найдена", En: "User group not found"},
		ErrorExist:       {Ru: "Такая группа уже существует", En: "User group already exists"},
		PermissionDenied: {Ru: "У вас нет прав к этой группе", En: "Permission denied to user group"},
		InternalError:    {Ru: "Ошибка при работе с группой пользователей", En: "Internal error with user group"},
	},
	EntityUserGroupRule: map[ErrorType]ExternalMessageError{
		ErrorNotFound:    {Ru: "Правило группы не найдено", En: "User group rule not found"},
		ErrorExist:       {Ru: "Такое правило уже существует", En: "User group rule already exists"},
		PermissionDenied: {Ru: "У вас нет прав к этому правилу", En: "Permission denied to user group rule"},
		InternalError:    {Ru: "Ошибка при работе с правилом группы", En: "Internal error with user group rule"},
	},
	EntityUserGroupRole: map[ErrorType]ExternalMessageError{
		ErrorNotFound:    {Ru: "Роль в группе не найдена", En: "User group role not found"},
		ErrorExist:       {Ru: "Такая роль уже существует в группе", En: "User group role already exists"},
		PermissionDenied: {Ru: "У вас нет прав к этой роли", En: "Permission denied to user group role"},
		InternalError:    {Ru: "Ошибка при работе с ролью в группе", En: "Internal error with user group role"},
	},
	EntityUserRule: map[ErrorType]ExternalMessageError{
		ErrorNotFound:    {Ru: "Правило пользователя не найдено", En: "User rule not found"},
		ErrorExist:       {Ru: "Такое правило уже существует", En: "User rule already exists"},
		PermissionDenied: {Ru: "У вас нет прав к этому правилу", En: "Permission denied to user rule"},
		InternalError:    {Ru: "Ошибка при работе с правилом пользователя", En: "Internal error with user rule"},
	},
	EntityUserRole: map[ErrorType]ExternalMessageError{
		ErrorNotFound:    {Ru: "Роль пользователя не найдена", En: "User role not found"},
		ErrorExist:       {Ru: "Такая роль уже существует", En: "User role already exists"},
		PermissionDenied: {Ru: "У вас нет прав к этой роли", En: "Permission denied to user role"},
		InternalError:    {Ru: "Ошибка при работе с ролью пользователя", En: "Internal error with user role"},
	},
	EntityRule: map[ErrorType]ExternalMessageError{
		ErrorNotFound:    {Ru: "Правило не найдено", En: "Rule not found"},
		ErrorExist:       {Ru: "Такое правило уже существует", En: "Rule already exists"},
		PermissionDenied: {Ru: "У вас нет прав к этому правилу", En: "Permission denied to rule"},
		InternalError:    {Ru: "Ошибка при работе с правилом", En: "Internal error with rule"},
	},
	EntityRole: map[ErrorType]ExternalMessageError{
		ErrorNotFound:    {Ru: "Роль не найдена", En: "Role not found"},
		ErrorExist:       {Ru: "Такая роль уже существует", En: "Role already exists"},
		PermissionDenied: {Ru: "У вас нет прав к этой роли", En: "Permission denied to role"},
		InternalError:    {Ru: "Ошибка при работе с ролью", En: "Internal error with role"},
	},
	EntityUpdateLog: map[ErrorType]ExternalMessageError{
		ErrorNotFound:    {Ru: "Лог обновления не найден", En: "Update log not found"},
		ErrorExist:       {Ru: "Такой лог обновления уже существует", En: "Update log already exists"},
		PermissionDenied: {Ru: "У вас нет прав к этому логу обновлений", En: "Permission denied to update log"},
		InternalError:    {Ru: "Ошибка при работе с логом обновлений", En: "Internal error with update log"},
	},
	EntityPermissionDenied: map[ErrorType]ExternalMessageError{
		ErrorNotFound:    {Ru: "Разрешение не найдено", En: "Permission not found"},
		ErrorExist:       {Ru: "Такое разрешение уже существует", En: "Permission already exists"},
		PermissionDenied: {Ru: "У вас нет прав :(", En: "Permission denied"},
		InternalError:    {Ru: "На сервере произошла ошибка при работе с правами", En: "Permission internal error"},
	},
	EntityCompliteExperimentInfo: map[ErrorType]ExternalMessageError{
		ErrorNotFound:    {Ru: "Полная информация о пайплайне не найдена. (Могла произойти ошибка с датасорсами, переменными или самим пайплайном)", En: "Complite experiment info not found"},
		ErrorExist:       {Ru: "Такой пайплайн уже существует", En: "Experiment already exists"},
		PermissionDenied: {Ru: "У вас нет прав к полной информации по этому пайплайну", En: "Permission denied to complite experiment info"},
		InternalError:    {Ru: "Ошибка сервера при обработке информации о пайплайне", En: "Internal server error during experiment info processing"},
	},
	EntityAppBanner: map[ErrorType]ExternalMessageError{
		ErrorNotFound:    {Ru: "Баннер не найден", En: "App banner not found"},
		ErrorExist:       {Ru: "Такой баннер уже существует", En: "App banner already exists"},
		PermissionDenied: {Ru: "У вас нет прав к этому баннеру", En: "Permission denied to app banner"},
		InternalError:    {Ru: "Ошибка при работе с баннером", En: "Internal error with app banner"},
	},
	EntityAppUpdate: map[ErrorType]ExternalMessageError{
		ErrorNotFound:    {Ru: "Обновление не найдено", En: "App update not found"},
		ErrorExist:       {Ru: "Такое обновление уже существует", En: "App update already exists"},
		PermissionDenied: {Ru: "У вас нет прав к этому обновлению", En: "Permission denied to app update"},
		InternalError:    {Ru: "Ошибка при работе с обновлением", En: "Internal error with app update"},
	},
	EntityAppUpcoming: map[ErrorType]ExternalMessageError{
		ErrorNotFound:    {Ru: "Upcoming контент не найден", En: "App upcoming not found"},
		ErrorExist:       {Ru: "Upcoming контент уже существует", En: "App upcoming already exists"},
		PermissionDenied: {Ru: "У вас нет прав к upcoming контенту", En: "Permission denied to app upcoming"},
		InternalError:    {Ru: "Ошибка при работе с upcoming контентом", En: "Internal error with app upcoming"},
	},
	EntityAppAbout: map[ErrorType]ExternalMessageError{
		ErrorNotFound:    {Ru: "About контент не найден", En: "App about not found"},
		ErrorExist:       {Ru: "About контент уже существует", En: "App about already exists"},
		PermissionDenied: {Ru: "У вас нет прав к about контенту", En: "Permission denied to app about"},
		InternalError:    {Ru: "Ошибка при работе с about контентом", En: "Internal error with app about"},
	},
	EntityCube: map[ErrorType]ExternalMessageError{
		ErrorNotFound:    {Ru: "Куб не найден", En: "Cube not found"},
		ErrorExist:       {Ru: "Куб с таким именем уже существует", En: "Cube with this name already exists"},
		PermissionDenied: {Ru: "У вас нет прав к этому кубу", En: "Permission denied to cube"},
		InternalError:    {Ru: "Ошибка при работе с кубом", En: "Internal error with cube"},
	},
}

type ErrorChecker func(err error, entityType EntityType) *responses.ErrorResponse

type ErrorCheckerChain struct {
	err        error
	EntityType EntityType
	checkers   []ErrorChecker
}

func (c *ErrorCheckerChain) End() *responses.ErrorResponse {
	if c.err == nil {
		return nil
	}

	var svcErr *svcerrors.ServiceError
	if errors.As(c.err, &svcErr) {
		return convertServiceError(svcErr, c.EntityType)
	}

	for _, check := range c.checkers {
		if refined := check(c.err, c.EntityType); refined != nil {
			return refined
		}
	}
	return FinalError()
}

// convertServiceError преобразует ServiceError в ErrorResponse
// Использует svcerrors.ToErrorResponse() для единообразной обработки
// Сохраняет fallback на старые сообщения из ErrorDetails для обратной совместимости
func convertServiceError(err *svcerrors.ServiceError, entityType EntityType) *responses.ErrorResponse {
	if err == nil {
		return nil
	}

	// Используем стандартный конвертер из service/errors
	resp := svcerrors.ToErrorResponse(err)
	if resp == nil {
		return nil
	}

	// Если есть кастомное сообщение в ServiceError, используем его
	if err.Message != "" {
		return resp
	}

	// Fallback на старые сообщения из ErrorDetails для обратной совместимости
	if msg, ok := sharedMessageForServiceError(entityType, err.Type); ok {
		resp.ExternalMessage = msg
	}

	// Убеждаемся, что InternalError установлен
	if resp.InternalError == nil {
		resp.InternalError = firstNonNilError(err.Err, err)
	}

	return resp
}

func firstNonNilError(primary error, fallback error) error {
	if primary != nil {
		return primary
	}
	return fallback
}

func sharedMessageForServiceError(entityType EntityType, errType svcerrors.ErrorType) (string, bool) {
	entityMessages, ok := ErrorDetails[entityType]
	if !ok {
		return "", false
	}

	switch errType {
	case svcerrors.ErrorTypeNotFound:
		if msg, ok := entityMessages[ErrorNotFound]; ok {
			return msg.Ru, true
		}
	case svcerrors.ErrorTypeConflict:
		if msg, ok := entityMessages[ErrorExist]; ok {
			return msg.Ru, true
		}
	case svcerrors.ErrorTypeForbidden, svcerrors.ErrorTypeUnauthorized:
		if msg, ok := entityMessages[PermissionDenied]; ok {
			return msg.Ru, true
		}
	case svcerrors.ErrorTypeInternal, svcerrors.ErrorTypeServiceUnavailable, svcerrors.ErrorTypeUnprocessableEntity:
		if msg, ok := entityMessages[InternalError]; ok {
			return msg.Ru, true
		}
	}

	return "", false
}

func (c *ErrorCheckerChain) As(checkers ...ErrorChecker) *ErrorCheckerChain {
	c.checkers = append(c.checkers, checkers...)
	return c
}

func (c *ErrorCheckerChain) Or(checker ...ErrorChecker) *ErrorCheckerChain {
	return c.As(checker...)
}

func (c *ErrorCheckerChain) OrFinally(checker ErrorChecker) *responses.ErrorResponse {
	return c.Or(checker).End()
}

func NewErrorResponse(err error, entityType EntityType) *ErrorCheckerChain {
	return &ErrorCheckerChain{
		err:        err,
		EntityType: entityType,
	}
}

func CheckIfErrorWithContext(err error, context string) *ErrorCheckerChain {
	return &ErrorCheckerChain{
		err: xerrors.Wrap(err, context),
	}
}

func InternalServerError(err error, entityType EntityType) *responses.ErrorResponse {
	return &responses.ErrorResponse{
		InternalError:   err,
		ExternalMessage: ErrorDetails[entityType][InternalError].Ru,
		HTTPStatusCode:  http.StatusInternalServerError,
	}
}

func FinalError() *responses.ErrorResponse {
	return &responses.ErrorResponse{
		InternalError:   errors.New("bad usage of error chain"),
		ExternalMessage: "Unknown Error",
		HTTPStatusCode:  http.StatusInternalServerError,
	}
}

func NewNameExistsError(constraintName string) ErrorChecker {
	return func(err error, entityType EntityType) *responses.ErrorResponse {
		var pgErr *pgconn.PgError
		if xerrors.As(err, &pgErr) && pgErr.Code == UniqueConstraintViolationCode && pgErr.ConstraintName == constraintName {
			return &responses.ErrorResponse{
				InternalError:   err,
				ExternalMessage: ErrorDetails[entityType][ErrorExist].Ru,
				HTTPStatusCode:  http.StatusBadRequest,
			}
		}
		return nil
	}
}

func NotFoundError(err error, entityType EntityType) *responses.ErrorResponse {
	var pgErr *pgconn.PgError
	if xerrors.Is(err, pgx.ErrNoRows) || (xerrors.As(err, &pgErr) && pgErr.Code == FkConstraintViolationCode) {
		return &responses.ErrorResponse{
			InternalError:   err,
			ExternalMessage: ErrorDetails[entityType][ErrorNotFound].Ru,
			HTTPStatusCode:  http.StatusNotFound,
		}
	}

	return nil
}

func PermissionDeniedError(err error, entityType EntityType) *responses.ErrorResponse {
	return &responses.ErrorResponse{
		InternalError:   err,
		ExternalMessage: ErrorDetails[entityType][PermissionDenied].Ru,
		HTTPStatusCode:  http.StatusForbidden,
	}
}
