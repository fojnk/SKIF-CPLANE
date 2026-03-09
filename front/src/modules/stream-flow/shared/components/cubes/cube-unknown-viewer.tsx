import { Button, Flex, Text } from '@gravity-ui/uikit';
import React, { useCallback, useMemo, useState } from 'react';

import {
  CubeType,
  type DroppedCube,
} from '@/modules/stream-flow/entities/cubes';
import { ShowCodeModel } from '@/modules/stream-flow/features/editor/show-code';

import { CubeDisclosure } from './cube-disclosure';

// ============================================================================
// Типы для InputsMapping из конфига
// ============================================================================

interface ConfigInputMapping {
  Type: string; // 'CIT_RESHARDER' | 'CIT_CUBE' | 'CIT_RETRY'
  CubeName?: string;
  OutputName?: string;
}

// ============================================================================
// Компонент для отображения dropped куба (без CubeID)
// ============================================================================

interface CubeUnknownViewerProps {
  /** Dropped куб (без CubeID или не найден в списке) */
  cube: DroppedCube;
}

/**
 * Компонент для отображения dropped куба (без CubeID).
 * Использует CubeDisclosure с hasError=true для danger-стиля.
 * Показывает: имя, config, inputs, outputs, mappings.
 * Только для просмотра — без возможности редактирования.
 */
export const CubeUnknownViewer: React.FC<CubeUnknownViewerProps> = ({
  cube,
}) => {
  // Состояние disclosure
  const [expanded, setExpanded] = useState(false);

  // Есть ли параметры у куба
  const hasParams = cube.Params && Object.keys(cube.Params).length > 0;

  // Формируем JSON для показа параметров
  const paramsJson = useMemo(() => {
    if (!hasParams) return '';
    try {
      return JSON.stringify(cube.Params, null, 2);
    } catch {
      return '';
    }
  }, [cube.Params, hasParams]);

  // Открытие параметров в модалке просмотра кода
  const handleShowParams = useCallback(() => {
    if (paramsJson) {
      ShowCodeModel.start({
        title: `${cube.Name || 'Unknown Cube'} - Config`,
        code: paramsJson,
      });
    }
  }, [paramsJson, cube.Name]);

  // Получаем имена входных и выходных портов
  const inputNames = useMemo(() => {
    return (cube.InputNames || []).map((p) => p.name);
  }, [cube.InputNames]);

  const outputNames = useMemo(() => {
    return (cube.OutputNames || []).map((p) => p.name);
  }, [cube.OutputNames]);

  // Получаем InputsMapping из Params (это configCube)
  const inputsMapping = useMemo((): Record<string, ConfigInputMapping> => {
    if (!cube.Params?.InputsMapping) return {};
    return cube.Params.InputsMapping as Record<string, ConfigInputMapping>;
  }, [cube.Params]);

  // Форматируем маппинги для отображения
  const formattedInputMappings = useMemo(() => {
    const mappings: Array<{ inputName: string; text: string }> = [];

    Object.entries(inputsMapping).forEach(([inputName, mapping]) => {
      let text = '';
      const type = mapping.Type;

      if (type === 'CIT_CUBE' || type === CubeType.CUBE) {
        // input_name ← Cube «cube_name» output «output_name»
        const cubeName = mapping.CubeName || '?';
        const outputName = mapping.OutputName || '?';
        text = `${inputName} ← Cube «${cubeName}» output «${outputName}»`;
      } else if (type === 'CIT_RESHARDER' || type === CubeType.RESHARDER) {
        // input_name ← Resharder output «output_name»
        const outputName = mapping.OutputName || '?';
        text = `${inputName} ← Resharder output «${outputName}»`;
      } else if (type === 'CIT_RETRY' || type === CubeType.RETRY) {
        // input_name ← Retrier cube «cube_name»
        const cubeName = mapping.CubeName || '?';
        text = `${inputName} ← Retrier cube «${cubeName}»`;
      } else {
        text = `${inputName} ← Unknown type`;
      }

      mappings.push({ inputName, text });
    });

    return mappings;
  }, [inputsMapping]);

  // Форматируем выходные маппинги для отображения
  const formattedOutputMappings = useMemo(() => {
    const mappings: Array<{ outputName: string; text: string }> = [];

    (cube.OutputMappings || []).forEach((mapping) => {
      // output_name → Cube «cube_name» input «input_name»
      const text = `${mapping.outputName} → Cube «${mapping.targetCubeName}» input «${mapping.targetInputName}»`;
      mappings.push({ outputName: mapping.outputName, text });
    });

    return mappings;
  }, [cube.OutputMappings]);

  // Есть ли маппинги
  const hasMappings =
    formattedInputMappings.length > 0 || formattedOutputMappings.length > 0;

  return (
    <CubeDisclosure
      title={cube.Name || 'Unknown Cube'}
      cubeType={cube.CubeType}
      expanded={expanded}
      hasError
      onToggle={setExpanded}
    >
      <Flex direction="column" gap={3} style={{ paddingBottom: '12px' }}>
        {/* Config (Show params button) */}
        <Flex direction="row" gap={2} alignItems="center">
          <Text variant="body-1">Config:</Text>
          {hasParams ? (
            <Button view="flat-secondary" size="xs" onClick={handleShowParams}>
              Show config
            </Button>
          ) : (
            <Text variant="body-1" color="secondary">
              none
            </Text>
          )}
        </Flex>

        {/* Inputs */}
        {inputNames.length > 0 && (
          <Flex direction="column" gap={1} alignItems="baseline">
            <Text variant="body-1">Inputs:</Text>
            <Text
              variant="body-1"
              color="secondary"
              style={{ fontFamily: 'monospace', paddingLeft: '8px' }}
            >
              {inputNames.join(', ')}
            </Text>
          </Flex>
        )}

        {/* Outputs */}
        {outputNames.length > 0 && (
          <Flex direction="column" gap={1} alignItems="baseline">
            <Text variant="body-1">Outputs:</Text>
            <Text
              variant="body-1"
              color="secondary"
              style={{ fontFamily: 'monospace', paddingLeft: '8px' }}
            >
              {outputNames.join(', ')}
            </Text>
          </Flex>
        )}

        {/* Empty message if no inputs/outputs */}
        {inputNames.length === 0 && outputNames.length === 0 && (
          <Text variant="body-1" color="secondary">
            No inputs or outputs
          </Text>
        )}

        {/* Mappings section */}
        {hasMappings && (
          <Flex direction="column" gap={3}>
            {/* Input mappings */}
            {formattedInputMappings.length > 0 && (
              <Flex direction="column" gap={1}>
                <Text variant="body-1">Input connections:</Text>
                {formattedInputMappings.map(({ inputName, text }) => (
                  <Text
                    key={inputName}
                    variant="code-1"
                    color="secondary"
                    style={{ fontFamily: 'monospace', paddingLeft: '8px' }}
                  >
                    {text}
                  </Text>
                ))}
              </Flex>
            )}

            {/* Output mappings */}
            {formattedOutputMappings.length > 0 && (
              <Flex direction="column" gap={1}>
                <Text variant="body-1">Output connections:</Text>
                {formattedOutputMappings.map(({ outputName, text }) => (
                  <Text
                    key={outputName}
                    variant="code-1"
                    color="secondary"
                    style={{ fontFamily: 'monospace', paddingLeft: '8px' }}
                  >
                    {text}
                  </Text>
                ))}
              </Flex>
            )}
          </Flex>
        )}
      </Flex>
    </CubeDisclosure>
  );
};
