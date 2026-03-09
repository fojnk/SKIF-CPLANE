/**
 * Утилиты для работы с графом кубов
 */

import { customAlphabet } from 'nanoid';

import { DtoCubeTypeDC } from '@/modules/stream-flow/shared/api/__generated__/data-contracts';
import { getFormInitialValues } from '@/modules/stream-flow/shared/components/forms/utils';
import type { CubeInfoDC, ParamsDC } from '@/modules/stream-flow/shared/types';

import {
  CubeIOType,
  CubeType,
  type CubeWithId,
  type EditExperimentCube,
  type PortInfo,
} from '../types';

// Алфавит для генерации хешей (только заглавные буквы и цифры)
const HASH_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

// ============================================================================
// Генерация хешей
// ============================================================================

/**
 * Генерирует случайный хеш используя nanoid
 * @param length - Длина хеша (по умолчанию 6)
 * @returns Строка указанной длины в верхнем регистре
 */
export const generateHash = (length: number = 6): string => {
  const nanoid = customAlphabet(HASH_ALPHABET, length);
  return nanoid();
};

/**
 * Генерирует уникальный хеш для куба используя nanoid
 * @param length - Длина хеша (по умолчанию 24)
 * @returns Строка уникального хеша
 */
export const generateUniqueHash = (length: number = 24): string => {
  return generateHash(length);
};

// ============================================================================
// Работа с портами
// ============================================================================

/**
 * Создает массив портов с уникальными hash
 * @param portNames - Массив имен портов
 * @returns Массив PortInfo с уникальными hash
 */
export const createPortsWithHash = (portNames: string[]): PortInfo[] => {
  return portNames.map((name) => ({
    name,
    hash: `port_${generateHash(8)}`,
  }));
};

// ============================================================================
// Очистка параметров
// ============================================================================

/**
 * Очищает объект параметров от невалидных значений
 * - Удаляет поля со значением "undefined" (строка)
 * - Удаляет поля со значением undefined
 * - Удаляет пустые строки
 * - Конвертирует "true"/"false" строки в boolean
 * - Конвертирует custom поля из JSON строки в объект
 * - Рекурсивно обрабатывает вложенные объекты
 *
 * @param params - Объект параметров
 * @param schema - Схема параметров (опционально, для обработки custom типов)
 * @returns Очищенный объект параметров
 */
export const cleanParams = (
  params: Record<string, unknown>,
  schema?: ParamsDC[],
): Record<string, unknown> => {
  const result: Record<string, unknown> = {};

  // Создаём маппинг имя параметра → схема для быстрого доступа
  const schemaMap = new Map<string, ParamsDC>();
  // Создаём set имён one-of вариантов (они должны сохраняться даже если пустые)
  const oneOfVariantNames = new Set<string>();

  if (schema) {
    schema.forEach((param) => {
      if (param.name) {
        schemaMap.set(param.name, param);
      }
      // Собираем имена всех one-of вариантов
      if (param.one_of && param.one_of.length > 0) {
        param.one_of.forEach((variant) => {
          if (variant.name) {
            oneOfVariantNames.add(variant.name);
          }
        });
      }
    });
  }

  Object.entries(params).forEach(([key, value]) => {
    // Пропускаем undefined и строку "undefined"
    if (value === undefined || value === 'undefined') {
      return;
    }

    // Пропускаем пустые строки
    if (value === '') {
      return;
    }

    // Получаем схему параметра
    const paramSchema = schemaMap.get(key);
    const paramType = paramSchema?.type?.type;

    // Проверяем, является ли ключ one-of вариантом
    const isOneOfVariant = oneOfVariantNames.has(key);

    // Обрабатываем custom тип (JSON строка → объект)
    if (paramType === 'custom' && typeof value === 'string') {
      if (value.trim() !== '') {
        try {
          result[key] = JSON.parse(value);
        } catch {
          // Если не удалось распарсить, пропускаем
        }
      }
      return;
    }

    // Рекурсивно обрабатываем вложенные объекты (не массивы)
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      // Для one-of варианта получаем схему из oneOfVariants
      let nestedSchema = paramSchema?.type?.struct_params;
      if (isOneOfVariant && !nestedSchema) {
        // Ищем схему варианта в one_of
        schema?.forEach((param) => {
          if (param.one_of) {
            const variant = param.one_of.find((v) => v.name === key);
            if (variant?.type?.struct_params) {
              nestedSchema = variant.type.struct_params;
            }
          }
        });
      }

      const cleanedNested = cleanParams(
        value as Record<string, unknown>,
        nestedSchema,
      );

      // Для one-of вариантов ВСЕГДА добавляем (даже пустой объект)
      // Для обычных параметров добавляем только если объект не пустой
      if (isOneOfVariant || Object.keys(cleanedNested).length > 0) {
        result[key] = cleanedNested;
      }
      return;
    }

    // Обрабатываем массивы — всегда добавляем (даже пустые)
    if (Array.isArray(value)) {
      result[key] = value;
      return;
    }

    // Конвертируем "true"/"false" строки в boolean
    if (value === 'true') {
      result[key] = true;
      return;
    }
    if (value === 'false') {
      result[key] = false;
      return;
    }

    // Конвертируем строки в integer (если не содержат переменные ${...})
    if (paramType === 'integer' && typeof value === 'string') {
      // Если значение содержит переменные ${...} — сохраняем как строку
      if (/\$\{[^}]+\}/.test(value)) {
        result[key] = value;
        return;
      }
      const num = parseInt(value, 10);
      if (!isNaN(num)) {
        result[key] = num;
        return;
      }
    }

    // Конвертируем строки в double (если не содержат переменные ${...})
    if (paramType === 'double' && typeof value === 'string') {
      // Если значение содержит переменные ${...} — сохраняем как строку
      if (/\$\{[^}]+\}/.test(value)) {
        result[key] = value;
        return;
      }
      const num = parseFloat(value);
      if (!isNaN(num)) {
        result[key] = num;
        return;
      }
    }

    // Оставляем значение как есть
    result[key] = value;
  });

  return result;
};

// ============================================================================
// Создание кубов
// ============================================================================

/**
 * Интерфейс для распарсенных параметров куба
 */
interface ParsedCubeParams {
  inputs?: {
    type?: string;
    list_names?: string[];
  };
  outputs?: {
    type?: string;
    list_names?: string[];
  };
  args?: ParamsDC[];
}

/**
 * Определяет CubeIOType на основе строки типа
 */
const getIOType = (type?: string): CubeIOType => {
  if (type === 'static') return CubeIOType.STATIC;
  if (type === 'dynamic') return CubeIOType.DYNAMIC;
  return CubeIOType.EMPTY;
};

/**
 * Создает EditExperimentCube из базового куба (CubeInfoDC)
 * @param baseCube - Информация о базовом кубе из API
 * @returns EditExperimentCube для использования в редакторе или null если не удалось распарсить
 */
export const createExperimentCube = (
  baseCube: CubeInfoDC,
): EditExperimentCube | null => {
  // Парсим cube_params
  let parsedParams: ParsedCubeParams | null = null;
  try {
    if (baseCube.cube_params) {
      parsedParams = JSON.parse(baseCube.cube_params) as ParsedCubeParams;
    }
  } catch {
    return null;
  }

  if (!parsedParams) {
    return null;
  }

  // Проверяем наличие id
  if (baseCube.id === undefined || baseCube.id === null) {
    return null;
  }

  const Hash = generateHash(8);
  // Имя куба: BaseCubeName_HASH4 (например: ConcatWithDelay_AFZW)
  const baseCubeName = baseCube.name || 'Cube';
  const cubeName = `${baseCubeName}_${generateHash(4)}`;

  // Определяем типы входов и выходов
  const InputType = getIOType(parsedParams.inputs?.type);
  const OutputType = getIOType(parsedParams.outputs?.type);

  // Определяем тип куба (по умолчанию CUBE)
  const cubeType =
    baseCube.type === DtoCubeTypeDC.Retry ? CubeType.RETRY : CubeType.CUBE;

  // Получаем default значения для параметров куба
  const cubeParamsSchema = parsedParams.args || [];
  const defaultParams =
    cubeParamsSchema.length > 0
      ? getFormInitialValues('', cubeParamsSchema, true)
      : {};

  // Базовый объект куба
  const cube: EditExperimentCube = {
    Hash,
    Name: cubeName,
    CubeID: baseCube.id,
    CubeType: cubeType,
    InputsMapping: {},
    InputType,
    OutputType,
    ParamsName: baseCube.params_name,
    CubeParams: baseCube.cube_params,
    Params: defaultParams,
  };

  // InputNames: static - создаем PortInfo, dynamic - создаем 1 порт, empty - не создаем
  if (InputType === CubeIOType.STATIC) {
    const inputNames = parsedParams.inputs?.list_names ?? [];
    cube.InputNames = createPortsWithHash(inputNames);
  } else if (InputType === CubeIOType.DYNAMIC) {
    const initialInputPort: PortInfo = {
      name: `Input_${generateHash(4)}`,
      hash: `port_${generateHash(8)}`,
    };
    cube.InputNames = [initialInputPort];
  }

  // OutputNames: static - создаем PortInfo, dynamic - [], empty - не создаем
  if (OutputType === CubeIOType.STATIC) {
    const outputNames = parsedParams.outputs?.list_names ?? [];
    cube.OutputNames = createPortsWithHash(outputNames);
  } else if (OutputType === CubeIOType.DYNAMIC) {
    cube.OutputNames = [];
  }

  return cube;
};

// ============================================================================
// Конвертация кубов для сохранения в JSON
// ============================================================================

/**
 * Конвертирует кубы из формата редактирования в формат для JSON
 * Используется для синхронизации form → JSON
 *
 * ВАЖНО: CubeID больше не включается в результат!
 * CubeID теперь хранится в cubeConfig (additional_information)
 *
 * @param cubesRecord - Record кубов по hash из формы
 * @param resharderInputSources - Входные источники resharder для разрешения имён
 * @returns Массив кубов в формате JSON
 */
export const convertCubesToFormFormat = (
  cubesRecord: Record<string, EditExperimentCube>,
  resharderInputSources: PortInfo[],
): CubeWithId[] => {
  // Конвертируем Record в массив
  const cubes = Object.values(cubesRecord);

  // Создаём маппинг hash → name для портов resharder
  const resharderPortHashToName = new Map<string, string>();
  resharderInputSources.forEach((port) => {
    resharderPortHashToName.set(port.hash, port.name);
  });

  // Создаём маппинг cubeHash → cube для поиска кубов-источников
  const cubeHashToData = new Map<
    string,
    { name: string; outputPorts: PortInfo[] }
  >();
  cubes.forEach((cube) => {
    cubeHashToData.set(cube.Hash, {
      name: cube.Name,
      outputPorts: cube.OutputNames || [],
    });
  });

  return cubes.map((cube) => {
    // Конвертируем InputsMapping обратно в формат формы
    const formInputsMapping: Record<
      string,
      { Type: CubeType; OutputName?: string; CubeName?: string }
    > = {};

    // Создаём маппинг hash → name для входных портов куба
    const inputPortHashToName = new Map<string, string>();
    (cube.InputNames || []).forEach((port) => {
      inputPortHashToName.set(port.hash, port.name);
    });

    Object.entries(cube.InputsMapping || {}).forEach(
      ([inputPortHash, mapping]) => {
        // Пропускаем pending маппинги
        if (inputPortHash.startsWith('pending_')) {
          return;
        }

        // Получаем имя входного порта
        const inputPortName = inputPortHashToName.get(inputPortHash);
        if (!inputPortName) {
          return;
        }

        if (mapping.Type === CubeType.RESHARDER) {
          const outputName = resharderPortHashToName.get(
            mapping.OutputPortHash || '',
          );
          if (outputName) {
            formInputsMapping[inputPortName] = {
              Type: CubeType.RESHARDER,
              OutputName: outputName,
            };
          }
        } else if (mapping.Type === CubeType.RETRY) {
          // Преобразуем RetryCubeHash → имя куба для сохранения в конфиг
          let retryCubeName: string | undefined;
          if (mapping.RetryCubeHash) {
            const retryCube = cubes.find(
              (c) =>
                c.Hash === mapping.RetryCubeHash &&
                c.CubeType === CubeType.RETRY,
            );
            retryCubeName = retryCube?.Name;
          } else if (mapping.RetryCube) {
            // Обратная совместимость: используем старое имя если hash нет
            retryCubeName = mapping.RetryCube;
          }
          if (retryCubeName) {
            formInputsMapping[inputPortName] = {
              Type: CubeType.RETRY,
              CubeName: retryCubeName,
            };
          }
        } else if (mapping.Type === CubeType.CUBE && mapping.OutputCubeHash) {
          const sourceCube = cubeHashToData.get(mapping.OutputCubeHash);
          if (sourceCube) {
            const outputPort = sourceCube.outputPorts.find(
              (p) => p.hash === mapping.OutputPortHash,
            );
            if (outputPort) {
              formInputsMapping[inputPortName] = {
                Type: mapping.Type,
                OutputName: outputPort.name,
                CubeName: sourceCube.name,
              };
            }
          }
        }
      },
    );

    // Конвертируем OutputNames из PortInfo[] в string[]
    const outputNames = (cube.OutputNames || []).map((port) => port.name);

    // Формируем результат в фиксированном порядке:
    // 1. Name
    // 2. OutputNames (если dynamic - всегда, даже пустой; если empty - не выводим)
    // 3. InputsMapping
    // 4. CubeParamsName (если есть ParamsName - всегда, даже пустой {})
    const result: CubeWithId = {
      Name: cube.Name,
    };

    // OutputNames: для dynamic всегда выводим (даже пустой массив), для empty - не выводим
    if (cube.OutputType === CubeIOType.DYNAMIC) {
      result.OutputNames = outputNames;
    } else if (outputNames.length > 0) {
      // Для static или если есть данные - выводим
      result.OutputNames = outputNames;
    }

    // InputsMapping - всегда добавляем если есть маппинги
    if (Object.keys(formInputsMapping).length > 0) {
      result.InputsMapping = formInputsMapping;
    }

    // CubeParamsName - всегда добавляем если есть ParamsName (даже пустой {})
    if (cube.ParamsName) {
      let cubeParamsSchema: ParamsDC[] | undefined;
      if (cube.CubeParams) {
        try {
          const parsed = JSON.parse(cube.CubeParams);
          cubeParamsSchema = parsed?.args;
        } catch {
          // Если не удалось распарсить, используем без схемы
        }
      }

      const cleanedParams = cube.Params
        ? cleanParams(cube.Params, cubeParamsSchema)
        : {};
      // Всегда добавляем, даже если пустой объект
      result[cube.ParamsName] = cleanedParams;
    }

    return result;
  });
};
