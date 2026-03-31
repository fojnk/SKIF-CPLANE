import { Button, Flex, Text } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  type ParseDebugInfo,
  type CubesGraphParamsWithDebug,
} from '@/modules/control-plane/entities/cubes';
import { CubesDebuggerModel } from '@/modules/control-plane/features/cubes/debugger';
import { projectPageModel } from '@/modules/control-plane/pages/project';
import {
  CubeDisclosure,
  CubeViewerValidated,
} from '@/modules/control-plane/shared/components/cubes';

interface Props {
  selectedCubeHash?: string | null;
  graphData: CubesGraphParamsWithDebug | null;
  config: string;
  cubeConfig: string;
  onCubeSelect?: (cubeHash: string | null) => void;
  /** Список имён доступных переменных для подсветки ${variableName} */
  variableNames?: string[];
  /** Callback при клике на переменную */
  onVariableClick?: (variableName: string) => void;
}

// ============================================================================
// Debug Section
// ============================================================================

interface DebugSectionProps {
  debugInfo: ParseDebugInfo | null;
  onOpenDebugger: () => void;
}

const DebugSection = ({ debugInfo, onOpenDebugger }: DebugSectionProps) => {
  const errorCount = debugInfo?.errorCount ?? 0;
  const hasErrors = errorCount > 0;

  // Определяем цвет текста
  const textColor = hasErrors ? 'danger' : 'secondary';

  // Формируем заголовок
  const title = hasErrors ? `Models Debug: (${errorCount})` : 'Models Debug:';

  return (
    <Flex
      direction="row"
      alignItems="center"
      gap={4}
      style={{ marginTop: '36px' }}
    >
      <Text variant="code-1" color={textColor}>
        {title}
      </Text>
      <Button view="flat-secondary" size="xs" onClick={onOpenDebugger}>
        Show details
      </Button>
    </Flex>
  );
};

// ============================================================================
// Основной компонент
// ============================================================================

export const WorkerViewCubes = ({
  selectedCubeHash,
  graphData,
  config,
  cubeConfig,
  onCubeSelect,
  variableNames,
  onVariableClick,
}: Props) => {
  const [cubesList, failed] = useUnit([
    projectPageModel.experiment.cubes.$data,
    projectPageModel.experiment.cubes.$failed,
  ]);

  // Получаем JSON кубов из config
  const cubesConfigJson = useMemo(() => {
    try {
      const parsed = JSON.parse(config);
      const cubes = parsed?.Worker?.GraphConfig?.Cubes;
      if (cubes) {
        return JSON.stringify({ Cubes: cubes }, null, 2);
      }
      return '';
    } catch {
      return '';
    }
  }, [config]);

  // Получаем JSON данных графа для React Flow (для debugger)
  const graphDataJson = useMemo(() => {
    if (!graphData) return '';
    return JSON.stringify(
      {
        nodes: graphData.nodes,
        edges: graphData.edges,
        validatedCubes: graphData.validatedCubes,
      },
      null,
      2,
    );
  }, [graphData]);

  // Обработчик открытия debugger модалки
  const handleOpenDebugger = useCallback(() => {
    CubesDebuggerModel.start({
      mode: 'initial',
      debugInfo: graphData?.debug ?? null,
      cubesConfigJson,
      cubeConfigJson: cubeConfig,
      graphDataJson,
    });
  }, [graphData?.debug, cubesConfigJson, cubeConfig, graphDataJson]);

  // Состояние для управления открытыми disclosure
  const [expandedCubes, setExpandedCubes] = useState<Set<string>>(new Set());

  // Refs для скролла к выбранным элементам
  const cubeRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Используем валидированные кубы из graphData (мемоизируем для стабильности)
  const validatedCubes = useMemo(
    () => graphData?.validatedCubes ?? [],
    [graphData?.validatedCubes],
  );

  // Callback для выделения куба на графе (используем hash напрямую)
  const handleSelect = useCallback(
    (cubeHash: string) => () => {
      if (onCubeSelect) {
        onCubeSelect(cubeHash);
      }
    },
    [onCubeSelect],
  );

  // Callback для управления ref'ами
  const setRef = useCallback(
    (cubeKey: string) => (el: HTMLDivElement | null) => {
      if (el) {
        cubeRefs.current.set(cubeKey, el);
      } else {
        cubeRefs.current.delete(cubeKey);
      }
    },
    [],
  );

  // Callback для toggle
  // При закрытии выделенного куба — сбрасываем выделение
  // При открытии другого куба — сбрасываем выделение
  const handleToggle = useCallback(
    (cubeKey: string) => (expanded: boolean) => {
      if (expanded) {
        // Открываем куб — если это не выделенный куб, сбрасываем выделение
        if (selectedCubeHash && selectedCubeHash !== cubeKey) {
          onCubeSelect?.(null);
        }
      } else {
        // Закрываем куб — если это выделенный куб, сбрасываем выделение
        if (selectedCubeHash === cubeKey) {
          onCubeSelect?.(null);
        }
      }

      setExpandedCubes((prev) => {
        const next = new Set(prev);
        if (expanded) {
          next.add(cubeKey);
        } else {
          next.delete(cubeKey);
        }
        return next;
      });
    },
    [selectedCubeHash, onCubeSelect],
  );

  // Эффект для синхронизации с выбранным кубом из графа
  useEffect(() => {
    if (selectedCubeHash) {
      // Находим куб напрямую по hash
      const cube = validatedCubes.find((c) => c.hash === selectedCubeHash);
      if (!cube) {
        return;
      }

      // Используем hash как ключ
      const cubeKey = cube.hash;

      // Открываем только этот куб, закрываем все остальные
      setExpandedCubes(new Set([cubeKey]));

      // Скроллим к выбранному кубу
      setTimeout(() => {
        const element = cubeRefs.current.get(cubeKey);
        if (element) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }
      }, 100);
    }
  }, [selectedCubeHash, validatedCubes]);

  // Если ошибка загрузки, показываем ошибку
  if (failed) {
    return (
      <Text variant="body-1" color="danger">
        Error fetching models list from server
      </Text>
    );
  }

  // Если кубов нет
  if (validatedCubes.length === 0) {
    return <Text color="secondary">No models</Text>;
  }

  return (
    <Flex direction="column">
      {validatedCubes.map((cube, index) => {
        // Используем hash как уникальный ключ
        const cubeKey = cube.hash;

        return (
          <CubeDisclosure
            key={cubeKey}
            ref={setRef(cubeKey)}
            title={cube.name || `Model ${index + 1}`}
            cubeType={cube.cubeType}
            expanded={expandedCubes.has(cubeKey)}
            selected={cubeKey === selectedCubeHash}
            hasError={cube.hasError}
            onToggle={handleToggle(cubeKey)}
          >
            <CubeViewerValidated
              cube={cube}
              cubesList={cubesList ?? []}
              onSelect={handleSelect(cube.hash)}
              variableNames={variableNames}
              onVariableClick={onVariableClick}
            />
          </CubeDisclosure>
        );
      })}

      {/* Debug section */}
      <DebugSection
        debugInfo={graphData?.debug ?? null}
        onOpenDebugger={handleOpenDebugger}
      />
    </Flex>
  );
};
