package errors

import (
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
)

// Константы для кодов PostgreSQL ошибок
const (
	UniqueConstraintViolationCode = "23505"
	FkConstraintViolationCode     = "23503"
)

// Имена constraint для автоматического определения конфликтов
const (
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

// IsPostgresUniqueViolation проверяет, является ли ошибка нарушением уникальности в PostgreSQL
func IsPostgresUniqueViolation(err error) bool {
	if err == nil {
		return false
	}
	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) {
		return pgErr.Code == UniqueConstraintViolationCode
	}
	return false
}

// IsPostgresNotFound проверяет, является ли ошибка "не найдено" в PostgreSQL
func IsPostgresNotFound(err error) bool {
	if err == nil {
		return false
	}

	// pgx.ErrNoRows - это стандартная ошибка "не найдено"
	if errors.Is(err, pgx.ErrNoRows) {
		return true
	}

	// Foreign key violation также может означать "не найдено"
	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) {
		return pgErr.Code == FkConstraintViolationCode
	}

	return false
}

// GetConstraintName возвращает имя constraint из PostgreSQL ошибки
func GetConstraintName(err error) string {
	if err == nil {
		return ""
	}
	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) {
		return pgErr.ConstraintName
	}
	return ""
}

// ConvertPostgresError автоматически преобразует ошибки PostgreSQL в ServiceError
func ConvertPostgresError(err error, entityType EntityType) *ServiceError {
	if err == nil {
		return nil
	}

	// Проверяем на "не найдено"
	if IsPostgresNotFound(err) {
		return NewEntityNotFoundError(entityType, err)
	}

	// Проверяем на нарушение уникальности
	if IsPostgresUniqueViolation(err) {
		constraintName := GetConstraintName(err)
		message := EntityMessages[entityType].Exists

		// Специальные сообщения для известных constraints
		switch constraintName {
		case UniqueNamespaceConstraint:
			message = "Рабочее пространство с таким именем уже существует"
		case UniqueProjectConstraint:
			message = "Проект с таким именем уже существует в этом namespace"
		case UniqueExperimentTemplateConstraint:
			message = "Пайплайн с таким именем уже существует"
		case UniqueDatasetConstraint:
			message = "Источник данных с таким именем уже существует в этом проекте"
		case UniqueExperimentVariableConstraint:
			message = "Переменная с таким именем уже существует в пайплайне"
		case UniqueExperimentDatasetAlias:
			message = "Dataset с таким alias уже подключен к пайплайну"
		case UniqueUserGroupConstraint:
			message = "Группа с таким именем уже существует"
		case UniqueRoleConstraint:
			message = "Роль с таким именем уже существует"
		case UniqueCubeConstraint:
			message = "Куб с таким именем уже существует"
		}

		return NewEntityConflictError(entityType, message, err)
	}

	// Для остальных ошибок БД возвращаем internal error
	return NewEntityInternalError(entityType, EntityMessages[entityType].Internal, err)
}

// ErrorChecker - функция для проверки и преобразования ошибки
type ErrorChecker func(err error) *ServiceError

// CheckError - цепочка проверок ошибок (паттерн Chain of Responsibility)
type ErrorCheckChain struct {
	err      error
	entity   EntityType
	checkers []ErrorChecker
}

// NewErrorChain создает новую цепочку проверок ошибок
func NewErrorChain(err error, entityType EntityType) *ErrorCheckChain {
	return &ErrorCheckChain{
		err:    err,
		entity: entityType,
	}
}

// Check добавляет проверку в цепочку
func (c *ErrorCheckChain) Check(checker ErrorChecker) *ErrorCheckChain {
	c.checkers = append(c.checkers, checker)
	return c
}

// OrDefault возвращает результат первой успешной проверки или default ошибку
func (c *ErrorCheckChain) OrDefault(defaultErr *ServiceError) *ServiceError {
	if c.err == nil {
		return nil
	}

	for _, checker := range c.checkers {
		if result := checker(c.err); result != nil {
			return result
		}
	}

	if defaultErr != nil {
		return defaultErr
	}

	return NewEntityInternalError(c.entity, EntityMessages[c.entity].Internal, c.err)
}

// OrPostgres проверяет PostgreSQL ошибки автоматически
func (c *ErrorCheckChain) OrPostgres() *ServiceError {
	return c.Check(func(err error) *ServiceError {
		return ConvertPostgresError(err, c.entity)
	}).OrDefault(nil)
}
