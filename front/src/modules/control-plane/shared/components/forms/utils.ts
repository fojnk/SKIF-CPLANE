import { ParamsDC } from '@/modules/control-plane/shared/types';

import { ParamType, PARAM_TYPES, PARAM_TYPE_LABELS } from './types';

export const isValidParamType = (type: string): type is ParamType => {
  return PARAM_TYPES.includes(type as ParamType);
};
export const getParamTypeLabel = (type: string): string | null => {
  return isValidParamType(type) ? PARAM_TYPE_LABELS[type] : null;
};

// ============================================================================
// Утилиты для получения initial values формы с учётом default значений
// ============================================================================

/**
 * Преобразует значение в формат для формы
 * Для boolean конвертирует в строку ('true'/'false'/'undefined')
 * Для чисел сохраняет как строку
 */
const valueToFormValue = (value: unknown, type?: string): unknown => {
  if (value === null || value === undefined) {
    // Для boolean возвращаем 'undefined' строку
    if (type === 'boolean') {
      return 'undefined';
    }
    return '';
  }

  // Для boolean конвертируем в строку
  if (type === 'boolean') {
    if (typeof value === 'string') {
      return value;
    }
    if (typeof value === 'boolean') {
      return String(value);
    }
    return String(value);
  }

  // Для чисел конвертируем в строку
  if (type === 'integer' || type === 'double') {
    return String(value);
  }

  return value;
};

/**
 * Рекурсивно обрабатывает параметр и возвращает значение для формы
 * @param applyDefaults - если true, применяет default значения из схемы
 */
const processParamValue = (
  configValue: unknown,
  param: ParamsDC,
  hasValueInConfig: boolean,
  applyDefaults: boolean,
): unknown => {
  const type = param.type?.type;
  const nestedType = param.type?.nested_type;
  const structParams = param.type?.struct_params;

  // Обработка one_of
  // Параметр может не иметь type, но иметь one_of
  if (param.one_of && param.one_of.length > 0) {
    // Для one_of значения вариантов хранятся напрямую в объекте
    // Нужно обработать каждый вариант
    const result: Record<string, unknown> = {};

    if (
      configValue &&
      typeof configValue === 'object' &&
      !Array.isArray(configValue)
    ) {
      const configObj = configValue as Record<string, unknown>;

      param.one_of.forEach((variant) => {
        const variantName = variant.name;
        if (!variantName) return;

        if (variantName in configObj) {
          result[variantName] = processParamValue(
            configObj[variantName],
            variant,
            true,
            applyDefaults,
          );
        }
      });
    }

    return result;
  }

  // Обработка struct
  if (type === 'struct' && structParams && structParams.length > 0) {
    const structResult: Record<string, unknown> = {};

    structParams.forEach((structParam) => {
      const structParamName = structParam.name;
      if (!structParamName) return;

      // Специальная обработка для one_of внутри struct
      // Для one_of значения хранятся напрямую под именем варианта, а не под именем параметра
      if (structParam.one_of && structParam.one_of.length > 0) {
        if (
          hasValueInConfig &&
          configValue &&
          typeof configValue === 'object' &&
          !Array.isArray(configValue)
        ) {
          const configObj = configValue as Record<string, unknown>;

          // Ищем какой вариант one_of присутствует в конфиге
          structParam.one_of.forEach((variant) => {
            const variantName = variant.name;
            if (!variantName) return;

            if (variantName in configObj) {
              const processedVariant = processParamValue(
                configObj[variantName],
                variant,
                true,
                applyDefaults,
              );
              if (processedVariant !== undefined) {
                structResult[variantName] = processedVariant;
              }
            }
          });
        }
        return;
      }

      let structValue: unknown;
      let hasStructValue = false;

      if (
        hasValueInConfig &&
        configValue &&
        typeof configValue === 'object' &&
        !Array.isArray(configValue)
      ) {
        const configObj = configValue as Record<string, unknown>;
        hasStructValue = structParamName in configObj;
        structValue = configObj[structParamName];
      }

      // Рекурсивно обрабатываем вложенный параметр
      const processedValue = processParamValue(
        structValue,
        structParam,
        hasStructValue,
        applyDefaults,
      );

      // Добавляем значение если оно определено
      if (processedValue !== undefined) {
        structResult[structParamName] = processedValue;
      }
    });

    return structResult;
  }

  // Обработка array
  if (type === 'array') {
    if (hasValueInConfig && Array.isArray(configValue)) {
      // Если массив структур
      if (nestedType === 'struct' && structParams && structParams.length > 0) {
        return configValue.map((item) => {
          const itemResult: Record<string, unknown> = {};

          structParams.forEach((structParam) => {
            const structParamName = structParam.name;
            if (!structParamName) return;

            // Специальная обработка для one_of внутри struct в массиве
            // Для one_of значения хранятся напрямую под именем варианта
            if (structParam.one_of && structParam.one_of.length > 0) {
              if (item && typeof item === 'object' && !Array.isArray(item)) {
                const itemObj = item as Record<string, unknown>;

                // Ищем какой вариант one_of присутствует в элементе
                structParam.one_of.forEach((variant) => {
                  const variantName = variant.name;
                  if (!variantName) return;

                  if (variantName in itemObj) {
                    const processedVariant = processParamValue(
                      itemObj[variantName],
                      variant,
                      true,
                      applyDefaults,
                    );
                    if (processedVariant !== undefined) {
                      itemResult[variantName] = processedVariant;
                    }
                  }
                });
              }
              return;
            }

            let itemValue: unknown;
            let hasItemValue = false;

            if (item && typeof item === 'object' && !Array.isArray(item)) {
              const itemObj = item as Record<string, unknown>;
              hasItemValue = structParamName in itemObj;
              itemValue = itemObj[structParamName];
            }

            const processedValue = processParamValue(
              itemValue,
              structParam,
              hasItemValue,
              applyDefaults,
            );

            if (processedValue !== undefined) {
              itemResult[structParamName] = processedValue;
            }
          });

          return itemResult;
        });
      }

      // Массив примитивов
      return configValue.map((item) => valueToFormValue(item, nestedType));
    }

    // Используем default или пустой массив (только если applyDefaults)
    if (applyDefaults) {
      if (param.default !== undefined && Array.isArray(param.default)) {
        if (
          nestedType === 'struct' &&
          structParams &&
          structParams.length > 0
        ) {
          return param.default.map((item: unknown) => {
            const itemResult: Record<string, unknown> = {};

            structParams.forEach((structParam) => {
              const structParamName = structParam.name;
              if (!structParamName) return;

              // Специальная обработка для one_of внутри struct в default значениях
              if (structParam.one_of && structParam.one_of.length > 0) {
                if (item && typeof item === 'object' && !Array.isArray(item)) {
                  const itemObj = item as Record<string, unknown>;

                  structParam.one_of.forEach((variant) => {
                    const variantName = variant.name;
                    if (!variantName) return;

                    if (variantName in itemObj) {
                      const processedVariant = processParamValue(
                        itemObj[variantName],
                        variant,
                        true,
                        applyDefaults,
                      );
                      if (processedVariant !== undefined) {
                        itemResult[variantName] = processedVariant;
                      }
                    }
                  });
                }
                return;
              }

              let itemValue: unknown;
              let hasItemValue = false;

              if (item && typeof item === 'object' && !Array.isArray(item)) {
                const itemObj = item as Record<string, unknown>;
                hasItemValue = structParamName in itemObj;
                itemValue = itemObj[structParamName];
              }

              const processedValue = processParamValue(
                itemValue,
                structParam,
                hasItemValue,
                applyDefaults,
              );

              if (processedValue !== undefined) {
                itemResult[structParamName] = processedValue;
              }
            });

            return itemResult;
          });
        }

        return param.default.map((item: unknown) =>
          valueToFormValue(item, nestedType),
        );
      }

      return [];
    }

    return undefined;
  }

  // Обработка kv (key-value)
  if (type === 'kv') {
    if (
      hasValueInConfig &&
      configValue &&
      typeof configValue === 'object' &&
      !Array.isArray(configValue)
    ) {
      const kvResult: Record<string, unknown> = {};
      Object.entries(configValue as Record<string, unknown>).forEach(
        ([key, val]) => {
          kvResult[key] = valueToFormValue(val, nestedType);
        },
      );
      return kvResult;
    }

    // Используем default или пустой объект (только если applyDefaults)
    if (applyDefaults) {
      if (
        param.default !== undefined &&
        typeof param.default === 'object' &&
        !Array.isArray(param.default)
      ) {
        const kvResult: Record<string, unknown> = {};
        Object.entries(param.default as Record<string, unknown>).forEach(
          ([key, val]) => {
            kvResult[key] = valueToFormValue(val, nestedType);
          },
        );
        return kvResult;
      }

      return {};
    }

    return undefined;
  }

  // Обработка custom типа (значение в config - это JSON объект)
  if (type === 'custom') {
    if (hasValueInConfig) {
      // Преобразуем значение в JSON строку для отображения в форме
      try {
        return JSON.stringify(configValue, null, 2);
      } catch {
        return '';
      }
    }

    // Используем default значение (только если applyDefaults)
    if (applyDefaults && param.default !== undefined) {
      try {
        return JSON.stringify(param.default, null, 2);
      } catch {
        return '';
      }
    }

    return '';
  }

  // Примитивные типы
  if (hasValueInConfig) {
    return valueToFormValue(configValue, type);
  }

  // Используем default значение (только если applyDefaults)
  if (applyDefaults && param.default !== undefined) {
    return valueToFormValue(param.default, type);
  }

  // Для boolean без значения возвращаем 'undefined' (только если applyDefaults)
  if (applyDefaults && type === 'boolean') {
    return 'undefined';
  }

  return undefined;
};

/**
 * Получает начальные значения для формы из конфигурации
 *
 * @param config - JSON строка с конфигурацией (может быть пустой)
 * @param formParams - массив параметров формы (ParamsDC[])
 * @param applyDefaults - применять ли default значения из схемы (default: true)
 *                        true - для режима редактирования (заполняем пустые поля defaults)
 *                        false - для режима просмотра (показываем только реальные данные)
 * @returns объект с начальными значениями для react-final-form
 *
 * Логика при applyDefaults = true:
 * 1. Если поле есть в config — используем его значение
 * 2. Если поля нет в config, но есть default в formParams — используем default
 * 3. Для boolean без значения — 'undefined' (строка для RadioBoolean)
 * 4. Для массивов без значения — пустой массив []
 * 5. Для kv без значения — пустой объект {}
 *
 * Логика при applyDefaults = false:
 * 1. Возвращаем только значения из config
 * 2. Пустые поля остаются undefined
 */
export const getFormInitialValues = (
  config: string,
  formParams?: ParamsDC[],
  applyDefaults = true,
): Record<string, unknown> => {
  if (!formParams || formParams.length === 0) {
    return {};
  }

  let parsedConfig: Record<string, unknown> = {};

  if (config) {
    try {
      const parsed = JSON.parse(config);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        parsedConfig = parsed;
      }
    } catch (_error) {
      // eslint-disable-next-line no-empty
    }
  }

  const initialValues: Record<string, unknown> = {};

  formParams.forEach((param) => {
    const paramName = param.name;
    if (!paramName) return;

    // Проверяем one_of на верхнем уровне
    // Для one_of значения вариантов хранятся напрямую в форме (не в param.name)
    if (param.one_of && param.one_of.length > 0) {
      param.one_of.forEach((variant) => {
        const variantName = variant.name;
        if (!variantName) return;

        const hasVariantInConfig = variantName in parsedConfig;

        if (hasVariantInConfig) {
          const processedValue = processParamValue(
            parsedConfig[variantName],
            variant,
            true,
            applyDefaults,
          );
          if (processedValue !== undefined) {
            initialValues[variantName] = processedValue;
          }
        }
      });
      return;
    }

    const hasValueInConfig = paramName in parsedConfig;
    const configValue = parsedConfig[paramName];

    const processedValue = processParamValue(
      configValue,
      param,
      hasValueInConfig,
      applyDefaults,
    );

    if (processedValue !== undefined) {
      initialValues[paramName] = processedValue;
    }
  });

  return initialValues;
};

// ============================================================================
// Утилиты для конвертации значений формы обратно в JSON
// ============================================================================

/** Регулярное выражение для проверки наличия переменных ${variableName} */
const VARIABLE_PATTERN = /\$\{[^}]+\}/;

/**
 * Проверяет, содержит ли значение переменные ${...}
 * Такие значения сохраняются как строки, даже если тип поля — integer/double
 */
const containsVariable = (value: unknown): boolean => {
  if (typeof value !== 'string') return false;
  return VARIABLE_PATTERN.test(value);
};

/**
 * Преобразует значение из формы обратно в правильный тип для JSON
 * Возвращает undefined для пустых значений - они не попадут в итоговый JSON
 */
export const formValueToJsonValue = (
  value: unknown,
  type?: string,
): unknown => {
  // Пустые значения не попадают в JSON
  if (value === '' || value === null || value === undefined) {
    return undefined;
  }

  // Если значение содержит переменные ${...} — сохраняем как строку
  // независимо от типа поля (integer, double и т.д.)
  if (containsVariable(value)) {
    return String(value);
  }

  // Boolean
  if (type === 'boolean') {
    if (typeof value === 'boolean') return value;
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (value === 'undefined') return undefined;
    return Boolean(value);
  }

  // Integer
  if (type === 'integer') {
    if (typeof value === 'number') return Math.floor(value);
    const num = parseInt(String(value), 10);
    return isNaN(num) ? undefined : num;
  }

  // Double
  if (type === 'double') {
    if (typeof value === 'number') return value;
    const num = parseFloat(String(value));
    return isNaN(num) ? undefined : num;
  }

  // Custom (JSON строка → объект)
  if (type === 'custom') {
    if (typeof value === 'string' && value.trim() !== '') {
      try {
        return JSON.parse(value);
      } catch {
        return undefined;
      }
    }
    return undefined;
  }

  // String и остальные типы
  return value;
};

/**
 * Проверяет, является ли значение пустым
 */
const isEmptyValue = (value: unknown): boolean => {
  if (value === null || value === undefined || value === '') {
    return true;
  }

  // Пустой массив
  if (Array.isArray(value) && value.length === 0) {
    return true;
  }

  // Пустой объект
  if (
    typeof value === 'object' &&
    !Array.isArray(value) &&
    Object.keys(value as object).length === 0
  ) {
    return true;
  }

  return false;
};

/**
 * Рекурсивно сортирует ключи в объекте
 * Использует ту же логику, что и PostgreSQL JSONB:
 * сначала по длине ключа, затем по алфавиту
 */
const sortObjectKeys = (obj: unknown): unknown => {
  if (obj === null || obj === undefined) {
    return obj;
  }

  // Если это массив, сортируем каждый элемент рекурсивно
  if (Array.isArray(obj)) {
    return obj.map((item) => sortObjectKeys(item));
  }

  // Если это объект, сортируем его ключи
  if (typeof obj === 'object') {
    const sortedObj: Record<string, unknown> = {};
    const sortedKeys = Object.keys(obj as object).sort((a, b) => {
      if (a.length !== b.length) {
        return a.length - b.length;
      }
      return a.localeCompare(b);
    });

    sortedKeys.forEach((key) => {
      sortedObj[key] = sortObjectKeys((obj as Record<string, unknown>)[key]);
    });

    return sortedObj;
  }

  return obj;
};

/**
 * Преобразует все значения объекта формы в правильные типы согласно схеме
 * параметров для сохранения в JSON
 *
 * @param values - значения формы
 * @param formParams - схема параметров формы
 * @param originalConfig - оригинальный конфиг (JSON строка или объект).
 *                         Если передан, поля первого уровня, которых нет в formParams,
 *                         будут сохранены из оригинального конфига.
 */
export const convertFormValuesToJson = (
  values: Record<string, unknown>,
  formParams: ParamsDC[],
  originalConfig?: string | Record<string, unknown>,
): Record<string, unknown> => {
  const result: Record<string, unknown> = {};

  // Парсим оригинальный конфиг если он передан как строка
  let originalConfigObj: Record<string, unknown> | null = null;
  if (originalConfig) {
    if (typeof originalConfig === 'string') {
      try {
        const parsed = JSON.parse(originalConfig);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          originalConfigObj = parsed;
        }
      } catch {
        // Игнорируем ошибку парсинга
      }
    } else if (
      typeof originalConfig === 'object' &&
      !Array.isArray(originalConfig)
    ) {
      originalConfigObj = originalConfig;
    }
  }

  // Собираем все известные имена параметров из схемы (включая варианты one_of)
  const knownParamNames = new Set<string>();
  formParams.forEach((param) => {
    if (param.name) {
      knownParamNames.add(param.name);
    }
    // Добавляем также имена вариантов one_of
    if (param.one_of && param.one_of.length > 0) {
      param.one_of.forEach((variant) => {
        if (variant.name) {
          knownParamNames.add(variant.name);
        }
      });
    }
  });

  // Сначала добавляем неизвестные поля из оригинального конфига (первый уровень)
  if (originalConfigObj) {
    Object.entries(originalConfigObj).forEach(([key, value]) => {
      if (!knownParamNames.has(key)) {
        // Это поле не известно схеме - сохраняем его как есть
        result[key] = value;
      }
    });
  }

  formParams.forEach((param) => {
    const paramName = param.name;
    if (!paramName) return;

    const value = values[paramName];
    const type = param.type?.type;
    const nestedType = param.type?.nested_type;

    // Обрабатываем one_of
    // Параметр может не иметь type, но иметь one_of
    if (param.one_of && param.one_of.length > 0) {
      // DEBUG: Логируем обработку one_of
      // Для one_of значения вариантов хранятся напрямую в values (не в param.name)
      // Ищем какой вариант выбран и обрабатываем его
      // ВАЖНО: для one_of выбранный вариант ВСЕГДА добавляется в результат,
      // даже если он пустой ({}, [], '')
      param.one_of.forEach((variant) => {
        const variantName = variant.name;
        if (!variantName) return;

        const variantValue = values[variantName];

        // Пропускаем только undefined/null — это означает что вариант НЕ выбран
        if (variantValue === undefined || variantValue === null) return;

        // Рекурсивно обрабатываем значение варианта
        const variantType = variant.type?.type;

        if (variantType === 'struct' && variant.type?.struct_params) {
          if (
            variantValue &&
            typeof variantValue === 'object' &&
            !Array.isArray(variantValue)
          ) {
            const structValue = convertFormValuesToJson(
              variantValue as Record<string, unknown>,
              variant.type.struct_params,
            );
            // Для one_of ВСЕГДА добавляем выбранный вариант (даже пустой {})
            result[variantName] = structValue;
          } else {
            // Вариант выбран но значение пустое ('' от React Final Form) — добавляем пустой объект
            result[variantName] = {};
          }
        } else if (variantType === 'array') {
          const variantNestedType = variant.type?.nested_type;

          if (Array.isArray(variantValue)) {
            if (variantNestedType === 'struct' && variant.type?.struct_params) {
              const convertedArray = variantValue
                .map((item) => {
                  if (
                    item &&
                    typeof item === 'object' &&
                    !Array.isArray(item)
                  ) {
                    return convertFormValuesToJson(
                      item as Record<string, unknown>,
                      variant.type!.struct_params!,
                    );
                  }
                  return item;
                })
                .filter((item) => !isEmptyValue(item));
              // Для one_of ВСЕГДА добавляем выбранный вариант (даже пустой [])
              result[variantName] = convertedArray;
            } else {
              const convertedArray = variantValue
                .map((item) => formValueToJsonValue(item, variantNestedType))
                .filter((item) => !isEmptyValue(item));
              // Для one_of ВСЕГДА добавляем выбранный вариант (даже пустой [])
              result[variantName] = convertedArray;
            }
          } else {
            // Значение не массив, но тип array — добавляем пустой массив
            result[variantName] = [];
          }
        } else if (
          variantType === 'kv' &&
          variantValue &&
          typeof variantValue === 'object'
        ) {
          const kvObject: Record<string, unknown> = {};
          const variantNestedType = variant.type?.nested_type;
          Object.entries(variantValue as Record<string, unknown>).forEach(
            ([key, val]) => {
              if (key && !isEmptyValue(val)) {
                kvObject[key] = formValueToJsonValue(val, variantNestedType);
              }
            },
          );
          // Для one_of ВСЕГДА добавляем выбранный вариант (даже пустой {})
          result[variantName] = kvObject;
        } else {
          // Примитивные типы (string, integer, double, boolean)
          const convertedValue = formValueToJsonValue(
            variantValue,
            variantType,
          );

          // Для one_of примитивов: добавляем если значение не undefined
          // (пустая строка '' тоже добавляется — это валидное значение для выбранного варианта)
          if (convertedValue !== undefined) {
            result[variantName] = convertedValue;
          } else {
            // Если конвертация вернула undefined (например, пустая строка для integer),
            // добавляем дефолтное значение по типу
            if (variantType === 'string') {
              result[variantName] = '';
            } else if (variantType === 'boolean') {
              // boolean 'undefined' конвертируется в undefined — не добавляем
              // пользователь должен явно выбрать true/false
            }
            // Для integer/double не добавляем undefined — это означает что значение не введено
          }
        }
      });
      return;
    }

    // Обрабатываем struct рекурсивно
    if (type === 'struct' && param.type?.struct_params) {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        const structValue = convertFormValuesToJson(
          value as Record<string, unknown>,
          param.type.struct_params,
        );
        if (!isEmptyValue(structValue)) {
          result[paramName] = structValue;
        }
      }
      return;
    }

    // Обрабатываем массивы
    if (type === 'array' && Array.isArray(value)) {
      // Для массива структур используем рекурсивную конвертацию с фильтрацией по схеме
      if (nestedType === 'struct' && param.type?.struct_params) {
        const structParams = param.type.struct_params;
        const filteredArray = value
          .map((item) => {
            if (item && typeof item === 'object' && !Array.isArray(item)) {
              return convertFormValuesToJson(
                item as Record<string, unknown>,
                structParams,
              );
            }
            return item;
          })
          .filter((item) => !isEmptyValue(item));

        if (filteredArray.length > 0) {
          result[paramName] = filteredArray;
        }
        return;
      }

      // Для массива примитивов
      const filteredArray = value
        .map((item) => formValueToJsonValue(item, nestedType))
        .filter((item) => !isEmptyValue(item));

      if (filteredArray.length > 0) {
        result[paramName] = filteredArray;
      }
      return;
    }

    // Обрабатываем KV (key-value объекты)
    if (type === 'kv' && value && typeof value === 'object') {
      const kvObject: Record<string, unknown> = {};

      Object.entries(value as Record<string, unknown>).forEach(([key, val]) => {
        if (key && !isEmptyValue(val)) {
          kvObject[key] = formValueToJsonValue(val, nestedType);
        }
      });

      if (Object.keys(kvObject).length > 0) {
        result[paramName] = kvObject;
      }
      return;
    }

    // Обрабатываем custom тип (преобразуем JSON строку обратно в объект)
    if (type === 'custom' && typeof value === 'string' && value.trim() !== '') {
      try {
        const parsed = JSON.parse(value);
        result[paramName] = parsed;
      } catch {
        // Если не удалось распарсить, пропускаем
      }
      return;
    }

    // Преобразуем значение в правильный тип
    const convertedValue = formValueToJsonValue(value, type);

    if (!isEmptyValue(convertedValue)) {
      result[paramName] = convertedValue;
    }
  });

  // Сортируем вложенные объекты, но сохраняем порядок первого уровня из оригинального конфига
  // Сначала применяем sortObjectKeys только к значениям (не к ключам первого уровня)
  const sortedValuesResult: Record<string, unknown> = {};
  Object.keys(result).forEach((key) => {
    sortedValuesResult[key] = sortObjectKeys(result[key]);
  });

  // Если есть оригинальный конфиг, упорядочиваем ключи первого уровня по его порядку
  if (originalConfigObj) {
    const orderedResult: Record<string, unknown> = {};
    const originalKeys = Object.keys(originalConfigObj);
    const resultKeys = new Set(Object.keys(sortedValuesResult));

    // Сначала добавляем ключи в порядке оригинального конфига
    originalKeys.forEach((key) => {
      if (resultKeys.has(key)) {
        orderedResult[key] = sortedValuesResult[key];
        resultKeys.delete(key);
      }
    });

    // Затем добавляем новые ключи (которых не было в оригинале) - сортируем их
    const newKeys = Array.from(resultKeys).sort((a, b) => {
      if (a.length !== b.length) {
        return a.length - b.length;
      }
      return a.localeCompare(b);
    });
    newKeys.forEach((key) => {
      orderedResult[key] = sortedValuesResult[key];
    });

    return orderedResult;
  }

  // Если оригинального конфига нет, сортируем ключи первого уровня как раньше
  const sortedKeys = Object.keys(sortedValuesResult).sort((a, b) => {
    if (a.length !== b.length) {
      return a.length - b.length;
    }
    return a.localeCompare(b);
  });

  const finalResult: Record<string, unknown> = {};
  sortedKeys.forEach((key) => {
    finalResult[key] = sortedValuesResult[key];
  });

  return finalResult;
};
