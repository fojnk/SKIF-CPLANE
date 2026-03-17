import { NodesRight } from '@gravity-ui/icons';
import {
  Button,
  Flex,
  Icon,
  Tab,
  TabList,
  TabProvider,
  Text,
} from '@gravity-ui/uikit';
import React, { useMemo, useState } from 'react';

import {
  CubeType,
  MappingErrorType,
  type ValidatedCubeData,
  type ValidatedInputMapping,
} from '@/modules/control-plane/entities/cubes';
import { FormParamView } from '@/modules/control-plane/shared/components/forms/form-param-view';
import { CubeListDC, ParamsDC } from '@/modules/control-plane/shared/types';

import { CubeBaseInfo } from './cube-base-info';
import { NamesFieldView } from './names-field-view';

// ============================================================================
// Типы
// ============================================================================

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

// ============================================================================
// Компонент для отображения валидированных маппингов
// ============================================================================

interface ValidatedMappingsViewProps {
  mappings: ValidatedInputMapping[];
}

const ValidatedMappingsView: React.FC<ValidatedMappingsViewProps> = ({
  mappings,
}) => {
  // Показываем только валидные маппинги
  const validMappings = mappings.filter((m) => m.isValid);

  if (validMappings.length === 0) {
    return (
      <Text variant="body-1" color="secondary">
        No mappings
      </Text>
    );
  }

  // Получаем название типа для отображения
  const getTypeName = (type: CubeType): string => {
    switch (type) {
      case CubeType.RESHARDER:
        return 'CIT_RESHARDER';
      case CubeType.RETRY:
        return 'CIT_RETRY';
      default:
        return 'CIT_CUBE';
    }
  };

  return (
    <Flex direction="column" gap={2}>
      {validMappings.map((mapping, index) => (
        <Flex
          key={`${mapping.inputPortName}-${index}`}
          direction="column"
          gap={1}
          style={{
            padding: '8px 12px',
            border: '1px dashed var(--g-color-base-generic)',
            borderRadius: 0,
          }}
        >
          <Text variant="body-1" style={{ fontWeight: 600 }}>
            {mapping.inputPortName}
          </Text>
          <Flex direction="row" gap={1} alignItems="center">
            <Text variant="body-1" color="secondary">
              Type:
            </Text>
            <Text variant="body-1">{getTypeName(mapping.type)}</Text>
          </Flex>
          {mapping.type !== CubeType.RESHARDER && (
            <Flex direction="row" gap={1} alignItems="center">
              <Text variant="body-1" color="secondary">
                CubeName:
              </Text>
              <Text variant="body-1">{mapping.sourceName}</Text>
            </Flex>
          )}
          {mapping.type !== CubeType.RETRY && (
            <Flex direction="row" gap={1} alignItems="center">
              <Text variant="body-1" color="secondary">
                OutputName:
              </Text>
              <Text variant="body-1">{mapping.outputPortName}</Text>
            </Flex>
          )}
        </Flex>
      ))}
    </Flex>
  );
};

// ============================================================================
// Компонент CubeViewerValidated для отображения валидированных данных
// ============================================================================

interface CubeViewerValidatedProps {
  /** Валидированные данные куба */
  cube: ValidatedCubeData;
  /** Список всех доступных кубов из справочника */
  cubesList: CubeListDC[];
  /** Callback для выделения куба на графе */
  onSelect?: () => void;
  /** Список имён доступных переменных для подсветки ${variableName} */
  variableNames?: string[];
  /** Callback при клике на переменную */
  onVariableClick?: (variableName: string) => void;
}

// Форматирует текст ошибки маппинга (формат как в debugger)
const getMappingErrorText = (
  errorType: MappingErrorType,
  name: string,
  inputPortName?: string,
  sourceName?: string,
): string => {
  const forInput = inputPortName ? ` for input «${inputPortName}»` : '';

  // Resharder и Retrier — не кубы, не используем слово "cube"
  const isSpecialSource =
    sourceName === 'Resharder' || sourceName === 'Retrier';
  const fromSource = sourceName
    ? isSpecialSource
      ? ` from «${sourceName}»`
      : ` from cube «${sourceName}»`
    : '';

  switch (errorType) {
    case MappingErrorType.INVALID_INPUT:
      return `Invalid input «${name}»`;
    case MappingErrorType.MISSING_CUBE_NAME:
      return `Missing source cube name${forInput}`;
    case MappingErrorType.CUBE_NOT_FOUND:
      return `Cube «${name}» not found${forInput}`;
    case MappingErrorType.INVALID_OUTPUT:
      return `Invalid output «${name}»${fromSource}${forInput}`;
    case MappingErrorType.INVALID_CUBE_TYPE:
      return `CIT_RETRY requires RETRY cube, but «${name}» is not a RETRY cube`;
    default:
      return 'Unknown error';
  }
};

export const CubeViewerValidated: React.FC<CubeViewerValidatedProps> = ({
  cube,
  cubesList,
  onSelect,
  variableNames,
  onVariableClick,
}) => {
  // Состояние для активного таба
  const [activeTab, setActiveTab] = useState('general');

  // Поиск базового куба по ID
  const baseCube = cubesList.find((c) => c.id === cube.cubeId);

  // Получаем ключ параметров из baseCube.params_name
  const paramsKey = baseCube?.params_name;

  // Парсим оригинальный конфиг для получения параметров куба
  // (параметры не валидируются, показываем как есть)
  const cubeParamsSchema = useMemo(() => {
    if (!baseCube?.cube_params) return [] as ParamsDC[];

    try {
      const parsedParams: ParsedCubeParams = JSON.parse(baseCube.cube_params);
      return parsedParams.args || [];
    } catch {
      return [] as ParamsDC[];
    }
  }, [baseCube?.cube_params]);

  // Собираем ошибки куба
  const errors: string[] = [];
  if (!cube.name || cube.name.trim() === '') errors.push('Empty CubeName');
  if (cube.cubeId === 0) {
    errors.push('Missing CubeTypeID');
  } else if (!baseCube) {
    errors.push(`Cube not found`);
  }
  if (cube.hasDuplicateName) errors.push('Duplicate CubeName');

  // Собираем ошибки маппингов
  cube.validatedMappings.forEach((mapping) => {
    mapping.errors.forEach((error) => {
      errors.push(
        getMappingErrorText(
          error.type,
          error.name,
          error.inputPortName,
          error.sourceName,
        ),
      );
    });
  });

  // Подсчет валидных маппингов для счетчика таба
  const validMappingsCount = cube.validatedMappings.filter(
    (m) => m.isValid,
  ).length;

  // Определяем, есть ли параметры у куба
  // Параметры доступны, если есть схема и значения из конфига
  const hasParams =
    cubeParamsSchema.length > 0 &&
    cube.paramsValues &&
    Object.keys(cube.paramsValues).length > 0;

  return (
    <Flex direction="column" gap={3} style={{ paddingBottom: '12px' }}>
      {/* Блок ошибок (если есть) */}
      {errors.length > 0 && (
        <Flex
          direction="column"
          gap={1}
          style={{
            padding: '8px 12px',
            backgroundColor: 'var(--g-color-base-danger-light)',
            borderRadius: '6px',
          }}
        >
          {errors.map((error, idx) => (
            <Text key={idx} variant="body-1" color="danger">
              {error}
            </Text>
          ))}
        </Flex>
      )}

      {/* Табы */}
      <Flex direction="row" alignItems="center" justifyContent="space-between">
        <TabProvider value={activeTab} onUpdate={setActiveTab}>
          <TabList style={{ width: '100%' }}>
            <Tab value="general">General</Tab>
            <Tab value="params" disabled={!hasParams}>
              Params
            </Tab>
            <Tab value="mappings" counter={validMappingsCount}>
              Mappings
            </Tab>
          </TabList>
        </TabProvider>
        {onSelect && (
          <Button view="flat-action" size="xs" onClick={onSelect}>
            <Icon data={NodesRight} size={14} />
          </Button>
        )}
      </Flex>

      {/* Tab: General */}
      {activeTab === 'general' && (
        <Flex direction="column" gap={3}>
          {/* Информация о базовом кубе */}
          <CubeBaseInfo baseCube={baseCube ?? null} paramsKey={paramsKey} />

          {/* Input Names (валидированные) */}
          <NamesFieldView
            label="InputNames"
            type={cube.inputType}
            names={cube.inputNames}
          />

          {/* Output Names (валидированные) */}
          <NamesFieldView
            label="OutputNames"
            type={cube.outputType}
            names={cube.outputNames}
          />
        </Flex>
      )}

      {/* Tab: Params */}
      {activeTab === 'params' && hasParams && (
        <FormParamView
          params={cubeParamsSchema}
          values={cube.paramsValues || {}}
          variableNames={variableNames}
          onVariableClick={onVariableClick}
        />
      )}

      {/* Tab: Mappings (валидированные) */}
      {activeTab === 'mappings' && (
        <ValidatedMappingsView mappings={cube.validatedMappings} />
      )}
    </Flex>
  );
};
