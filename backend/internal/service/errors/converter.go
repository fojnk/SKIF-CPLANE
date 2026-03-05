package errors

import (
	"errors"

	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/responses"
)

// ToErrorResponse преобразует ServiceError в responses.ErrorResponse
// Это bridge между сервисным слоем и HTTP слоем
// Использует детализированные сообщения если они доступны
// Использует errors.As() для правильной обработки обернутых ошибок
func ToErrorResponse(err error) *responses.ErrorResponse {
	if err == nil {
		return nil
	}

	var serviceErr *ServiceError
	if errors.As(err, &serviceErr) {
		message := serviceErr.Message
		if message == "" {
			message = serviceErr.GetDetailedMessage()
		}

		return &responses.ErrorResponse{
			InternalError:   serviceErr.Err,
			ExternalMessage: message,
			HTTPStatusCode:  serviceErr.GetHTTPStatusCode(),
		}
	}

	// Если это не ServiceError, возвращаем как internal error
	return &responses.ErrorResponse{
		InternalError:   err,
		ExternalMessage: "Внутренняя ошибка сервера",
		HTTPStatusCode:  500,
	}
}

// ToErrorResponseWithFallback преобразует ошибку с fallback сообщением
func ToErrorResponseWithFallback(err error, fallbackMessage string, fallbackStatus int) *responses.ErrorResponse {
	if err == nil {
		return nil
	}

	var serviceErr *ServiceError
	if errors.As(err, &serviceErr) {
		message := serviceErr.Message
		if message == "" {
			message = serviceErr.GetDetailedMessage()
		}

		return &responses.ErrorResponse{
			InternalError:   serviceErr.Err,
			ExternalMessage: message,
			HTTPStatusCode:  serviceErr.GetHTTPStatusCode(),
		}
	}

	// Используем fallback для обычных ошибок
	return &responses.ErrorResponse{
		InternalError:   err,
		ExternalMessage: fallbackMessage,
		HTTPStatusCode:  fallbackStatus,
	}
}

// WrapError оборачивает обычную ошибку в ServiceError типа Internal
func WrapError(message string, err error) *ServiceError {
	return NewInternalError(message, err)
}

// WrapErrorWithEntity оборачивает ошибку с указанием типа сущности
func WrapErrorWithEntity(entityType EntityType, message string, err error) *ServiceError {
	return NewEntityInternalError(entityType, message, err)
}

