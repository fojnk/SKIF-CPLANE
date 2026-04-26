package orch

import (
	"encoding/json"
	"fmt"
	"regexp"
	"strconv"
	"strings"

	"github.com/pkg/errors"
)

type ExperimentVariableType string

const (
	ExperimentVariableTypeString ExperimentVariableType = "string"
	ExperimentVariableTypeInt    ExperimentVariableType = "int"
	ExperimentVariableTypeJSON   ExperimentVariableType = "json"
	ExperimentVariableTypeYQL    ExperimentVariableType = "yql"
	ExperimentVariableTypePython ExperimentVariableType = "python"
)

var varRegexp = regexp.MustCompile(`\${([a-zA-Z0-9_]+):?([a-zA-Z0-9_]+)?}`)
var onlyVarRegexp = regexp.MustCompile(`^\${([a-zA-Z0-9_]+):?([a-zA-Z0-9_]+)?}$`)

func formatValueJSON(v string, vr ExperimentVariable) (any, error) {
	if vr.Type != ExperimentVariableTypeJSON {
		return nil, errors.New("expected json variable type, got " + string(vr.Type))
	}

	matches := onlyVarRegexp.FindAllStringSubmatch(v, -1)
	if len(matches) != 1 {
		return nil, errors.New("invalid json variable format. When using json, it can only be \"${VARIABLE_NAME}\"")
	}

	var m map[string]any
	if err := json.Unmarshal([]byte(vr.Value), &m); err != nil {
		return nil, errors.Wrap(err, "failed to unmarshal json variable")
	}

	return m, nil
}

func formatValueInt(v string, vr ExperimentVariable) (any, error) {
	if vr.Type != ExperimentVariableTypeInt {
		return nil, errors.New("expected int variable type, got " + string(vr.Type))
	}

	matches := onlyVarRegexp.FindAllStringSubmatch(v, -1)
	if len(matches) != 1 {
		return nil, errors.New("invalid int variable format. When using int, it can only be \"${VARIABLE_NAME}\"")
	}

	res, err := strconv.Atoi(vr.Value)
	if err != nil {
		return nil, errors.Wrap(err, "failed to parse int variable")
	}

	return res, nil
}

func formatValuePython(v string, vr ExperimentVariable) (any, error) {
	if vr.Type != ExperimentVariableTypePython {
		return nil, errors.New("expected python variable type, got " + string(vr.Type))
	}

	return strings.Replace(v, fmt.Sprintf("${%s}", vr.Name), vr.Value, 1), nil
}

func formatValueYQL(v string, vr ExperimentVariable) (any, error) {
	if vr.Type != ExperimentVariableTypeYQL {
		return nil, errors.New("expected yql variable type, got " + string(vr.Type))
	}

	matches := onlyVarRegexp.FindAllStringSubmatch(v, -1)
	if len(matches) != 1 {
		return nil, errors.New("invalid yql variable format. When using yql, it can only be \"${VARIABLE_NAME}\"")
	}

	return vr.Value, nil
}

func formatValueString(v string, vr ExperimentVariable) (any, error) {
	if vr.Type != ExperimentVariableTypeString {
		return nil, errors.New("expected string variable type, got " + string(vr.Type))
	}

	return strings.Replace(v, fmt.Sprintf("${%s}", vr.Name), vr.Value, 1), nil
}

func extractVariableInfo(match []string) (string, string) {
	// match[0] - полный матч
	// match[1] - тип переменной или имя переменной (в зависимости от формата)
	// match[2] - имя переменной (если указан тип)

	if len(match) >= 3 && match[2] != "" {
		// Формат ${type:variable_name} - есть тип и имя
		return match[1], match[2]
	} else if len(match) >= 2 && match[1] != "" {
		// Формат ${variable_name} - только имя переменной
		return "", match[1]
	}
	return "", ""
}

func formatValue(v string, vars map[string]ExperimentVariable) (any, error) {
	matches := varRegexp.FindAllStringSubmatch(v, -1)
	if len(matches) == 0 {
		return v, nil
	}

	for _, match := range matches {
		typeName, varName := extractVariableInfo(match)

		// Если указан тип в плейсхолдере, используем его вместо типа из переменной
		vr, ok := vars[varName]
		if !ok {
			return nil, fmt.Errorf("variable not found: %s, available variables: %v", varName, vars)
		}

		// Определяем тип переменной для использования
		var effectiveType ExperimentVariableType
		if typeName != "" {
			// Используем тип из плейсхолдера
			switch typeName {
			case "string":
				effectiveType = ExperimentVariableTypeString
			case "int":
				effectiveType = ExperimentVariableTypeInt
			case "json":
				effectiveType = ExperimentVariableTypeJSON
			case "yql":
				effectiveType = ExperimentVariableTypeYQL
			case "python":
				effectiveType = ExperimentVariableTypePython
			default:
				// Если тип неизвестен, используем тип из переменной
				effectiveType = vr.Type
			}
		} else {
			// Используем тип из переменной
			effectiveType = vr.Type
		}

		// Для случая, когда мы хотим получить значение в нужном типе, но не меняем саму переменную
		// Возвращаем значение напрямую, если это не специальный случай
		if typeName != "" {
			// Если указан тип в плейсхолдере, то нужно вернуть значение в нужном типе
			switch effectiveType {
			case ExperimentVariableTypeString:
				// Для строки просто возвращаем строковое значение
				return vr.Value, nil
			case ExperimentVariableTypeInt:
				// Для int конвертируем значение
				res, err := strconv.Atoi(vr.Value)
				if err != nil {
					return nil, errors.Wrap(err, "failed to parse int variable")
				}
				return res, nil
			case ExperimentVariableTypeJSON:
				// Для JSON делаем парсинг
				var m map[string]any
				if err := json.Unmarshal([]byte(vr.Value), &m); err != nil {
					return nil, errors.Wrap(err, "failed to unmarshal json variable")
				}
				return m, nil
			case ExperimentVariableTypeYQL:
				return vr.Value, nil
			case ExperimentVariableTypePython:
				return strings.Replace(v, fmt.Sprintf("${%s}", vr.Name), vr.Value, 1), nil
			default:
				return nil, errors.New(fmt.Sprintf("unknown variable type: %s", effectiveType))
			}
		} else {
			// Используем тип из переменной
			switch vr.Type {
			case ExperimentVariableTypeString:
				return formatValueString(v, vr)
			case ExperimentVariableTypeInt:
				return formatValueInt(v, vr)
			case ExperimentVariableTypeJSON:
				return formatValueJSON(v, vr)
			case ExperimentVariableTypeYQL:
				return formatValueYQL(v, vr)
			case ExperimentVariableTypePython:
				return formatValuePython(v, vr)
			default:
				return nil, errors.New(fmt.Sprintf("unknown variable type: %s", vr.Type))
			}
		}
	}

	return v, nil
}

func enrichValue(v any, vars map[string]ExperimentVariable) (any, error) {
	switch v := v.(type) {
	case string:
		return formatValue(v, vars)
	case map[string]any:
		for k, v1 := range v {
			v1, err := enrichValue(v1, vars)
			if err != nil {
				return nil, err
			}
			v[k] = v1
		}
		return v, nil
	case []any:
		for i, v1 := range v {
			v1, err := enrichValue(v1, vars)
			if err != nil {
				return nil, err
			}
			v[i] = v1
		}
		return v, nil
	default:
		return v, nil
	}
}

// EnrichAnyWithVariables подставляет значения переменных пайплайна в произвольный JSON-совместимый объект (как в SupervisorPipelineConfig).
func EnrichAnyWithVariables(v any, vars map[string]ExperimentVariable) (any, error) {
	return enrichValue(v, vars)
}
