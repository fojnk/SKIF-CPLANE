/**
 * Утилиты для валидации портов кубов (InputNames, OutputNames)
 *
 * Логика для OutputNames:
 * - empty: OutputNames игнорируются (пустой массив)
 * - static: OutputNames берутся из базового куба (list_names)
 * - dynamic: OutputNames берутся из config куба, дубли отсекаются
 */

import { CubeIOType } from '../types';

// ============================================================================
// Типы
// ============================================================================

/** Распарсенные параметры IO из базового куба */
interface ParsedIOParams {
  type?: 'static' | 'dynamic' | 'empty';
  list_names?: string[];
}

/** Распарсенные параметры базового куба */
interface ParsedBaseCubeParams {
  inputs?: ParsedIOParams;
  outputs?: ParsedIOParams;
}

/** Результат валидации OutputNames */
export interface ValidatedOutputNames {
  /** Тип выходных портов (static/dynamic/empty) */
  outputType: CubeIOType;
  /** Валидированные имена выходных портов */
  outputNames: string[];
}

/** Результат валидации InputNames */
export interface ValidatedInputNames {
  /** Тип входных портов (static/dynamic/empty) */
  inputType: CubeIOType;
  /** Валидированные имена входных портов */
  inputNames: string[];
}

// ============================================================================
// Вспомогательные функции
// ============================================================================

/**
 * Парсит cube_params базового куба
 */
function parseBaseCubeParams(
  cubeParamsJson: string | undefined,
): ParsedBaseCubeParams | null {
  if (!cubeParamsJson) return null;

  try {
    return JSON.parse(cubeParamsJson) as ParsedBaseCubeParams;
  } catch {
    return null;
  }
}

/**
 * Преобразует строковый тип в CubeIOType
 */
function getIOType(type?: string): CubeIOType {
  if (type === 'static') return CubeIOType.STATIC;
  if (type === 'dynamic') return CubeIOType.DYNAMIC;
  return CubeIOType.EMPTY;
}

/**
 * Убирает дубликаты из массива строк, сохраняя порядок
 */
function removeDuplicates(names: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const name of names) {
    if (!seen.has(name)) {
      seen.add(name);
      result.push(name);
    }
  }

  return result;
}

// ============================================================================
// Основные функции валидации
// ============================================================================

/**
 * Валидирует OutputNames куба на основе типа из базового куба
 *
 * Логика:
 * - empty: возвращаем пустой массив (игнорируем OutputNames из config)
 * - static: возвращаем list_names из базового куба (игнорируем OutputNames из config)
 * - dynamic: берём OutputNames из config и отсекаем дубли
 *
 * @param baseCubeParams - JSON строка cube_params базового куба
 * @param configOutputNames - OutputNames из config куба
 * @returns Валидированные OutputNames с типом
 *
 * @example
 * // static - берём из базового куба
 * validateOutputNames('{"outputs":{"type":"static","list_names":["out1","out2"]}}', ['ignored'])
 * // { outputType: 'static', outputNames: ['out1', 'out2'] }
 *
 * // dynamic - берём из config, убираем дубли
 * validateOutputNames('{"outputs":{"type":"dynamic"}}', ['out1', 'out2', 'out1'])
 * // { outputType: 'dynamic', outputNames: ['out1', 'out2'] }
 *
 * // empty - игнорируем config
 * validateOutputNames('{"outputs":{"type":"empty"}}', ['out1'])
 * // { outputType: 'empty', outputNames: [] }
 */
export function validateOutputNames(
  baseCubeParams: string | undefined,
  configOutputNames: string[] | undefined,
): ValidatedOutputNames {
  const parsed = parseBaseCubeParams(baseCubeParams);

  // Если не удалось распарсить - возвращаем empty
  if (!parsed) {
    return {
      outputType: CubeIOType.EMPTY,
      outputNames: [],
    };
  }

  const outputType = getIOType(parsed.outputs?.type);

  switch (outputType) {
    case CubeIOType.EMPTY:
      // empty: игнорируем OutputNames из config
      return {
        outputType: CubeIOType.EMPTY,
        outputNames: [],
      };

    case CubeIOType.STATIC:
      // static: берём list_names из базового куба
      return {
        outputType: CubeIOType.STATIC,
        outputNames: parsed.outputs?.list_names ?? [],
      };

    case CubeIOType.DYNAMIC:
      // dynamic: берём из config и убираем дубли
      return {
        outputType: CubeIOType.DYNAMIC,
        outputNames: removeDuplicates(configOutputNames ?? []),
      };

    default:
      return {
        outputType: CubeIOType.EMPTY,
        outputNames: [],
      };
  }
}

/**
 * Валидирует InputNames куба на основе типа из базового куба
 *
 * Логика:
 * - empty: возвращаем пустой массив (игнорируем все InputNames)
 * - static: возвращаем list_names из базового куба
 * - dynamic: объединяем ключи из InputsMapping (config) и InputNames из cubeConfig,
 *            отсекаем дубли
 *
 * @param baseCubeParams - JSON строка cube_params базового куба
 * @param inputsMappingKeys - Ключи из InputsMapping (из config куба)
 * @param cubeConfigInputNames - InputNames из cubeConfig (additional_information)
 * @returns Валидированные InputNames с типом
 *
 * @example
 * // static - берём из базового куба
 * validateInputNames(
 *   '{"inputs":{"type":"static","list_names":["in1","in2"]}}',
 *   ['ignored'],
 *   ['ignored']
 * )
 * // { inputType: 'static', inputNames: ['in1', 'in2'] }
 *
 * // dynamic - объединяем ключи InputsMapping и InputNames из cubeConfig
 * validateInputNames(
 *   '{"inputs":{"type":"dynamic"}}',
 *   ['Input0', 'Input1'],  // ключи из InputsMapping
 *   ['Input2', 'Input0']   // InputNames из cubeConfig
 * )
 * // { inputType: 'dynamic', inputNames: ['Input0', 'Input1', 'Input2'] }
 *
 * // empty - игнорируем всё
 * validateInputNames(
 *   '{"inputs":{"type":"empty"}}',
 *   ['Input0'],
 *   ['Input1']
 * )
 * // { inputType: 'empty', inputNames: [] }
 */
export function validateInputNames(
  baseCubeParams: string | undefined,
  inputsMappingKeys: string[],
  cubeConfigInputNames: string[] | undefined,
): ValidatedInputNames {
  const parsed = parseBaseCubeParams(baseCubeParams);

  // Если не удалось распарсить - возвращаем empty
  if (!parsed) {
    return {
      inputType: CubeIOType.EMPTY,
      inputNames: [],
    };
  }

  const inputType = getIOType(parsed.inputs?.type);

  switch (inputType) {
    case CubeIOType.EMPTY:
      // empty: игнорируем все InputNames
      return {
        inputType: CubeIOType.EMPTY,
        inputNames: [],
      };

    case CubeIOType.STATIC:
      // static: берём list_names из базового куба
      return {
        inputType: CubeIOType.STATIC,
        inputNames: parsed.inputs?.list_names ?? [],
      };

    case CubeIOType.DYNAMIC: {
      // dynamic: объединяем ключи из InputsMapping и InputNames из cubeConfig
      // 1. Сначала берём все ключи из InputsMapping (они имеют приоритет)
      // 2. Затем добавляем InputNames из cubeConfig
      // 3. Отсекаем дубли
      const allInputNames = [
        ...inputsMappingKeys,
        ...(cubeConfigInputNames ?? []),
      ];
      return {
        inputType: CubeIOType.DYNAMIC,
        inputNames: removeDuplicates(allInputNames),
      };
    }

    default:
      return {
        inputType: CubeIOType.EMPTY,
        inputNames: [],
      };
  }
}

/**
 * Получает тип и имена входных портов из базового куба
 *
 * @deprecated Используйте validateInputNames для полной валидации
 * @param baseCubeParams - JSON строка cube_params базового куба
 * @returns Тип и имена входных портов
 */
export function getInputPortsInfo(
  baseCubeParams: string | undefined,
): ValidatedInputNames {
  const parsed = parseBaseCubeParams(baseCubeParams);

  if (!parsed) {
    return {
      inputType: CubeIOType.EMPTY,
      inputNames: [],
    };
  }

  const inputType = getIOType(parsed.inputs?.type);

  return {
    inputType,
    inputNames: parsed.inputs?.list_names ?? [],
  };
}

/**
 * Получает тип и имена выходных портов из базового куба (только для static)
 *
 * @param baseCubeParams - JSON строка cube_params базового куба
 * @returns Тип и имена выходных портов
 */
export function getOutputPortsInfo(
  baseCubeParams: string | undefined,
): ValidatedOutputNames {
  const parsed = parseBaseCubeParams(baseCubeParams);

  if (!parsed) {
    return {
      outputType: CubeIOType.EMPTY,
      outputNames: [],
    };
  }

  const outputType = getIOType(parsed.outputs?.type);

  return {
    outputType,
    outputNames: parsed.outputs?.list_names ?? [],
  };
}
