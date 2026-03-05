package alerts

import "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service/errors"

// Коды ошибок для сервиса алёртов
// Используются для локализации сообщений об ошибках
const (
	// Ошибки работы с базой данных
	RetryPage      = "ALERTS_001"
	ContactSupport = "ALERTS_002"

	// Ошибки работы с сервисом one-alerts
	ErrCodeCheckIntegration = "ALERTS_003"

	// Ошибки работы с шаблонами и генератором
	ErrCodeAlertTemplateNotFound = "ALERTS_004"

	// Ошибки валидации и бизнес-логики
	ErrCodeNoAlertsAdded                     = "ALERTS_005"
	ErrCodeNoAlertsSpecified                 = "ALERTS_006"
	ErrCodeCannotCreateForDeletedExperiment    = "ALERTS_007"
	ErrCodeCannotGetForDeletedExperiment       = "ALERTS_008"
	ErrCodeAlertsNotExist                    = "ALERTS_009"
	ErrCodeUnexpectedAlertGroup              = "ALERTS_010"
	ErrCodeAlertNotFound                     = "ALERTS_011"
	ErrCodeCannotAddRuleWithExistingSeverity = "ALERTS_012"
	ErrCodeCannotChangeAlertSeverities       = "ALERTS_013"
	ErrCodeDuplicateAlertRuleInDB            = "ALERTS_014"
	ErrCodeTooManyRulesToDelete              = "ALERTS_015"

	// Общие ошибки
	ErrCodeBadRequest = "ALERTS_000"
)

// ErrorMessages содержит локализованные сообщения для кодов ошибок
// Используется для локализации сообщений об ошибках
var ErrorMessages = map[string]errors.ExternalMessageError{
	// Ошибки работы с базой данных
	RetryPage: {
		Ru: "Обновите страницу и повторите операцию, если ошибка не решилась, обратитесь к дежурному StreamFlow.",
		En: "Error getting alert groups from database",
	},
	ContactSupport: {
		Ru: "Обратитесь к дежурному StreamFlow.",
		En: "Error creating alert group in database",
	},

	// Ошибки работы с сервисом one-alerts
	ErrCodeCheckIntegration: {
		Ru: "Выполните шаги из инструкции по подключению и проверьте корректность настроек интеграции",
		En: "Follow the steps from the connection instructions and verify the integration settings",
	},

	// Ошибки работы с шаблонами и генератором
	ErrCodeAlertTemplateNotFound: {
		Ru: "Шаблон алёрта не найден. Обновите страницу, если ошибка не решилась, обратитесь к дежурному StreamFlow.",
		En: "Alert template not found",
	},

	// Ошибки валидации и бизнес-логики
	ErrCodeNoAlertsAdded: {
		Ru: "Не добавлено ни одного алёрта",
		En: "No alerts added",
	},
	ErrCodeNoAlertsSpecified: {
		Ru: "Не указано ни одного алёрта",
		En: "No alerts specified",
	},
	ErrCodeCannotCreateForDeletedExperiment: {
		Ru: "Нельзя создавать алёрты для пайплайна который удален",
		En: "Cannot create alerts for deleted experiment",
	},
	ErrCodeCannotGetForDeletedExperiment: {
		Ru: "Нельзя получить алёрты для пайплайна который удален",
		En: "Cannot get alerts for deleted experiment",
	},
	ErrCodeAlertsNotExist: {
		Ru: "Алёрты не существуют. Обновите страницу, если ошибка не решилась, обратитесь к дежурному StreamFlow.",
		En: "Alerts do not exist",
	},
	ErrCodeUnexpectedAlertGroup: {
		Ru: "Неожиданная группа алёртов. Ообратитесь к дежурному StreamFlow.",
		En: "Unexpected alert group",
	},
	ErrCodeAlertNotFound: {
		Ru: "Алёрт не найден. Обратитесь к дежурному StreamFlow.",
		En: "Alert not found",
	},
	ErrCodeCannotAddRuleWithExistingSeverity: {
		Ru: "Нельзя добавлять правило для шаблона, у которого уже есть такой severity.",
		En: "Cannot add rule for template that already has this severity level",
	},
	ErrCodeCannotChangeAlertSeverities: {
		Ru: "Изменять алёрты можно только для одного шаблона",
		En: "Alerts can only be changed for one template",
	},
	ErrCodeDuplicateAlertRuleInDB: {
		Ru: "В базе данных обнаружено больше одного правила с одним шаблоном и уровнем важности.",
		En: "Database contains more than one rule with the same template and severity level",
	},
	ErrCodeTooManyRulesToDelete: {
		Ru: "На удаление указано правил больше, чем существует. Обратитесь к дежурному StreamFlow.",
		En: "More rules specified for deletion than exist",
	},

	// Общие ошибки
	ErrCodeBadRequest: {
		Ru: "Некорректные данные алертов. Обратитесь к дежурному StreamFlow.",
		En: "Invalid alert data",
	},
}

// GetMessage возвращает локализованное сообщение об ошибке по коду
func GetMessage(code string, lang string) string {
	msg, ok := ErrorMessages[code]
	if !ok {
		return ErrorMessages[ErrCodeBadRequest].Ru
	}

	if lang == "en" {
		return msg.En
	}
	return msg.Ru
}
