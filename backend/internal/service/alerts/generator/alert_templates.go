package generator

import (
	"fmt"
	"regexp"
	"strconv"
	"strings"
	"unicode"

	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/dto/alerts"
)

type MeasureUnits struct {
	Units map[string]int
	Regex string
}

var measureUnits = map[string]MeasureUnits{
	"units": {
		Units: map[string]int{
			"k":   1000,
			"mln": 1000000,
			"bln": 1000000000,
		},
		Regex: "(k|mln|bln)$",
	},
	"seconds": {
		Units: map[string]int{
			"s": 1,
			"m": 60,
			"h": 3600,
			"d": 86400,
		},
		Regex: "(s|m|h|d)$",
	},
}

func (a *AlertGenerator) GetDelayFiringDescription() alerts.TypeLimits {
	return alerts.TypeLimits{
		Types:       []string{"s", "m", "h", "d"},
		Description: "Задержка срабатывания алёрта. Определяет промежуток времени, на протяжении которого значение метрики должно выходить за указанный предел для срабатывания алёрта. По умолчанию 0s. Возможные варианты значений: 10, 10_000, 10s, 10m, 10h, 10d",
	}
}

func (a *AlertGenerator) GetDelayResolvingDescription() alerts.TypeLimits {
	return alerts.TypeLimits{
		Types:       []string{"s", "m", "h", "d"},
		Description: "Задержка разрешения алёрта. Определяет промежуток времени, на протяжении которого значение метрики должно быть в нормальном состоянии для разрешения алёрта. По умолчанию 0s. Возможные варианты значений: 10, 10_000, 10s, 10m, 10h, 10d",
	}
}

func (a *AlertGenerator) ValidateRule(alertRule alerts.AlertRule) error {

	switch alertRule.Severity {
	case "info":
	case "warning":
	case "critical":
	case "disaster":
	case "Info":
	case "Warning":
	case "Critical":
	case "Disaster":
	default:
		return fmt.Errorf("некорректный severity: %s", alertRule.Severity)
	}

	alertTemplate, ok := a.alertTemplates[alertRule.AlertTemplateId]
	if !ok {
		return fmt.Errorf("шаблон алёрта с id %d не найден", alertRule.AlertTemplateId)
	}

	hasLimit := a.alertTemplates[alertRule.AlertTemplateId].HasLimit
	if hasLimit && alertRule.Limit == "" {
		return fmt.Errorf("Поле limit обязательно к заполнению")
	}

	if err := a.ValidateLimit(alertRule.DelayFiring, "seconds"); err != nil {
		return err
	}
	if err := a.ValidateLimit(alertRule.DelayResolving, "seconds"); err != nil {
		return err
	}

	if !hasLimit {
		return nil
	}
	if err := a.ValidateLimit(alertRule.Limit, alertTemplate.TypeLimit); err != nil {
		return err
	}

	return nil
}

func (a *AlertGenerator) ValidateLimit(value string, measureUnit string) error {
	uof, ok := measureUnits[measureUnit]
	if !ok {
		return fmt.Errorf("Некорректная единица измерения: %s", measureUnit)
	}
	limit := strings.ReplaceAll(value, "_", "")

	if len(limit) == 0 {
		return fmt.Errorf("Поле обязательно к заполнению")
	}

	if isDigits(limit) {
		return nil
	}

	re, err := regexp.Compile(uof.Regex)
	if err != nil {
		return fmt.Errorf("Некорректное регулярное выражение: %s", uof.Regex)
	}

	if !re.MatchString(limit) {
		return fmt.Errorf("В regex не найдена указанная единица измерения: %s", measureUnit)
	}

	if match := re.FindString(limit); match == "" {
		return fmt.Errorf("В regex не найдена указанная единица измерения: %s", measureUnit)
	}

	return nil
}

func (a *AlertGenerator) TransformRule(alertRule alerts.AlertRule) (alerts.AlertRule, error) {

	s := alertRule.Severity
	if len(s) > 0 {
		alertRule.Severity = strings.ToUpper(s[:1]) + strings.ToLower(s[1:])
	}
	alertTemplate, ok := a.alertTemplates[alertRule.AlertTemplateId]
	if !ok {
		return alerts.AlertRule{}, fmt.Errorf("шаблон алёрта с id %d не найден", alertRule.AlertTemplateId)
	}

	delayFiring, err := a.TransformLimit(alertRule.DelayFiring, "seconds")
	if err != nil {
		return alerts.AlertRule{}, err
	}
	alertRule.DelayFiring = delayFiring
	delayResolving, err := a.TransformLimit(alertRule.DelayResolving, "seconds")
	if err != nil {
		return alerts.AlertRule{}, err
	}
	alertRule.DelayResolving = delayResolving

	if !a.alertTemplates[alertRule.AlertTemplateId].HasLimit {
		return alertRule, nil
	}

	limit, err := a.TransformLimit(alertRule.Limit, alertTemplate.TypeLimit)
	if err != nil {
		return alerts.AlertRule{}, err
	}
	alertRule.Limit = limit

	return alertRule, nil
}

func (a *AlertGenerator) TransformLimit(value string, measureUnit string) (string, error) {
	unit := ""
	uof, ok := measureUnits[measureUnit]
	if !ok {
		return "", fmt.Errorf("Некорректная единица измерения: %s", measureUnit)
	}
	limit := strings.ReplaceAll(value, "_", "")

	if isDigits(limit) {
		return limit, nil
	}

	re, err := regexp.Compile(uof.Regex)
	if err != nil {
		return "", fmt.Errorf("Некорректное регулярное выражение: %s", uof.Regex)
	}

	unit = re.FindString(limit)
	limit = strings.TrimSuffix(limit, unit)

	limitInt, err := strconv.Atoi(limit)
	if err != nil {
		return "", fmt.Errorf("Некорректный лимит: %s: %w", limit, err)
	}
	res := limitInt * uof.Units[unit]

	return strconv.Itoa(res), nil
}

func isDigits(s string) bool {
	for _, r := range s {
		if !unicode.IsDigit(r) {
			return false
		}
	}
	return true
}

func getTypeLimits() map[string]alerts.TypeLimits {
	return map[string]alerts.TypeLimits{
		"units": {
			Types:       []string{"k", "mln", "bln"},
			Description: "Числовые единицы измерения, возможные варианты значений: 10, 10_000, 100k, 2mln, bln",
		},
		"seconds": {
			Types:       []string{"s", "m", "h", "d"},
			Description: "Временные единицы измерения, возможные варианты значений: 10, 10_000, 10s, 10m, 10h, 10d",
		},
		"absent": {
			Types:       []string{""},
			Description: "Проверка на отсутствие данных, предел не указывается",
		},
		"specified": {
			Types:       []string{""},
			Description: "Для данного алёрта используется фиксированный предел, логику работы смотреть в описании алёрта",
		},
	}
}

/*
Структура с описанием типов алёртов,
которые используются в сервисе streamFlow alerts.
Шаблоны алёртов хранятся в файлах templates/, ключ - id шаблона алёрта.
чисто логическое разделение шаблонов алёртов для удобства:
- рабочие алёрты начинаются с 1
- проверки на отсутствие данных начинаются с 101
*/
func getTemplates() map[int32]alerts.AlertTemplate {
	return map[int32]alerts.AlertTemplate{
		1: {
			GraphicName:      "RowLag",
			AlertName:        "row lag",
			Namespace:        "dzen",
			TemplateName:     "row_lag",
			HasLimit:         true,
			AlertDescription: "Алёрт отслеживает количество строк в очереди до текущего оффсета пайплайна. Превышение предела метрикой вызывает срабатывание алёрта. Состояние метрики определяется по графику RowLag.",
			TypeLimit:        "units",
		},
		2: {
			GraphicName:      "MaxTimeLag",
			AlertName:        "time lag",
			Namespace:        "dzen",
			TemplateName:     "time_lag",
			HasLimit:         true,
			AlertDescription: "Алёрт отслеживает максимальную задержку обработки записи между поступлением и взятием в работу. Превышение предела метрикой вызывает срабатывание алёрта. Состояние метрики определяется по графику MaxTimeLag.",
			TypeLimit:        "seconds",
		},
		3: {
			GraphicName:      "ResharderConsumed",
			AlertName:        "resharder consumed",
			Namespace:        "dzen",
			TemplateName:     "resharder_consumed",
			HasLimit:         true,
			AlertDescription: "Алёрт срабатывает при снижении потребления решардером сообщений в секунду ниже предела. Состояние метрики определяется по графику ResharderConsumed.",
			TypeLimit:        "units",
		},
		4: {
			GraphicName:      "WorkerConsumed",
			AlertName:        "worker consumed",
			Namespace:        "dzen",
			TemplateName:     "worker_consumed",
			HasLimit:         true,
			AlertDescription: "Алёрт срабатывает при снижении потребления воркером сообщений в секунду ниже предела. Состояние метрики определяется по графику WorkerConsumed.",
			TypeLimit:        "units",
		},
		5: {
			GraphicName:      "Resharder Failed Epoch Ratio",
			AlertName:        "resharder epoch ratio",
			Namespace:        "infra",
			TemplateName:     "resharder_epoch_ratio",
			HasLimit:         true,
			AlertDescription: "Алёрт отслеживает оотношение количества неудачных к удачным эпох решардера. Превышение предела метрикой вызывает срабатывание алёрта. Состояние метрики определяется по графику Resharder Failed Epoch Ratio.",
			TypeLimit:        "units",
		},
		6: {
			GraphicName:      "Worker Failed Epoch Ratio",
			AlertName:        "worker epoch ratio",
			Namespace:        "infra",
			TemplateName:     "worker_epoch_ratio",
			HasLimit:         true,
			AlertDescription: "Алёрт отслеживает оотношение количества неудачных к удачным эпох воркера. Превышение предела метрикой вызывает срабатывание алёрта. Состояние метрики определяется по графику Worker Failed Epoch Ratio.",
			TypeLimit:        "units",
		},
		7: {
			GraphicName:      "ResharderRowCount",
			AlertName:        "resharder row count is empty input",
			Namespace:        "infra",
			TemplateName:     "resharder_row_count_is_empty_input",
			HasLimit:         false,
			AlertDescription: "Алёрт срабатывает если количество входящих сообщений в решардер опустилось до 0. Состояние метрики определяется по графику ResharderRowCount.",
			TypeLimit:        "specified",
		},
		8: {
			GraphicName:      "ResharderRowCount",
			AlertName:        "resharder row count is empty output",
			Namespace:        "infra",
			TemplateName:     "resharder_row_count_is_empty_output",
			HasLimit:         false,
			AlertDescription: "Алёрт срабатывает если количество исходящих сообщений в решардер опустилось до 0. Состояние метрики определяется по графику ResharderRowCount.",
			TypeLimit:        "specified",
		},
		9: {
			GraphicName:      "ResharderRowCount",
			AlertName:        "resharder row count in/out is mismatch",
			Namespace:        "infra",
			TemplateName:     "resharder_row_count_in_out_is_mismatch",
			HasLimit:         false,
			AlertDescription: "Алёрт срабатывает если количество входящих и исходящих сообщений решардера не совпадает. Состояние метрики определяется по графику ResharderRowCount.",
			TypeLimit:        "specified",
		},
		10: {
			GraphicName:      "WorkerRowCount",
			AlertName:        "worker row count is empty",
			Namespace:        "infra",
			TemplateName:     "worker_row_count_is_empty",
			HasLimit:         false,
			AlertDescription: "Алёрт срабатывает если количество сообщений, обрабатываемых воркером, опустилось до 0. Состояние метрики определяется по графику WorkerRowCount.",
			TypeLimit:        "specified",
		},
		101: {
			GraphicName:      "RowLag",
			AlertName:        "row lag absent",
			Namespace:        "dzen",
			TemplateName:     "row_lag_absent",
			HasLimit:         false,
			AlertDescription: "Алёрт срабатывает если метрика row lag вместо данных возвращает NoData. Состояние метрики определяется по графику RowLag.",
			TypeLimit:        "absent",
		},
		102: {
			GraphicName:      "MaxTimeLag",
			AlertName:        "time lag absent",
			Namespace:        "dzen",
			TemplateName:     "time_lag_absent",
			HasLimit:         false,
			AlertDescription: "Алёрт срабатывает если метрика time lag вместо данных возвращает NoData. Состояние метрики определяется по графику MaxTimeLag.",
			TypeLimit:        "absent",
		},
		103: {
			GraphicName:      "ResharderConsumed",
			AlertName:        "resharder consumed absent",
			Namespace:        "dzen",
			TemplateName:     "resharder_consumed_absent",
			HasLimit:         false,
			AlertDescription: "Алёрт срабатывает если метрика resharder consumed вместо данных возвращает NoData. Состояние метрики определяется по графику ResharderConsumed.",
			TypeLimit:        "absent",
		},
		105: {
			GraphicName:      "Resharder Failed Epoch Ratio",
			AlertName:        "resharder epoch ratio absent",
			Namespace:        "infra",
			TemplateName:     "resharder_epoch_ratio_absent",
			HasLimit:         false,
			AlertDescription: "Алёрт срабатывает если метрика resharder epoch ratio вместо данных возвращает NoData. Состояние метрики определяется по графику Resharder Failed Epoch Ratio.",
			TypeLimit:        "absent",
		},
		106: {
			GraphicName:      "Worker Failed Epoch Ratio",
			AlertName:        "worker epoch ratio absent",
			Namespace:        "infra",
			TemplateName:     "worker_epoch_ratio_absent",
			HasLimit:         false,
			AlertDescription: "Алёрт срабатывает если метрика worker epoch ratio вместо данных возвращает NoData. Состояние метрики определяется по графику Worker Failed Epoch Ratio.",
			TypeLimit:        "absent",
		},
		107: {
			GraphicName:      "ResharderRowCount",
			AlertName:        "resharder row count is empty input absent",
			Namespace:        "infra",
			TemplateName:     "resharder_row_count_is_empty_input_absent",
			HasLimit:         false,
			AlertDescription: "Алёрт срабатывает если метрика resharder row count is empty input вместо данных возвращает NoData. Состояние метрики определяется по графику ResharderRowCount.",
			TypeLimit:        "absent",
		},
		108: {
			GraphicName:      "ResharderRowCount",
			AlertName:        "resharder row count is empty output absent",
			Namespace:        "infra",
			TemplateName:     "resharder_row_count_is_empty_output_absent",
			HasLimit:         false,
			AlertDescription: "Алёрт срабатывает если метрика resharder row count is empty output вместо данных возвращает NoData. Состояние метрики определяется по графику ResharderRowCount.",
			TypeLimit:        "absent",
		},
		109: {
			GraphicName:      "WorkerRowCount",
			AlertName:        "worker row count is empty absent",
			Namespace:        "infra",
			TemplateName:     "worker_row_count_is_empty_absent",
			HasLimit:         false,
			AlertDescription: "Алёрт срабатывает если метрика worker row count is empty вместо данных возвращает NoData. Состояние метрики определяется по графику WorkerRowCount.",
			TypeLimit:        "absent",
		},
	}
}
