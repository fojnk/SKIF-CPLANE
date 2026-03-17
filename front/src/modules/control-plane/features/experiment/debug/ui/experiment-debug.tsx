import { ChevronsExpandUpRight, TextIndent } from '@gravity-ui/icons';
import {
  Button,
  Flex,
  Icon,
  SegmentedRadioGroup,
  Select,
  Text,
} from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useFormState } from 'react-final-form';

import { LogViewer } from '@/modules/control-plane/shared/ui/log-viewer';
import { SFMonaco } from '@/modules/control-plane/shared/ui/sf-monaco';
import { formatYson } from '@/modules/control-plane/shared/utils/formatYson';

import * as ExperimentDebugModel from '../model';
import * as PortDataModel from '../port-data/model';
import { CubeRuns } from '../types';

import { CubeViewer } from './cube-viewer';
import { DebugSidebar } from './debug-sidebar';

// Типы из experiment-edit
interface FormInputSource {
  SourceName?: string;
  OutputName?: string;
  portHash?: string;
  [key: string]: unknown;
}

interface ExperimentFormValues {
  Resharder?: {
    InputSources?: FormInputSource[];
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface Props {
  debugMode: boolean;
  experiment_id: number;
  experiment_name: string;
  config: string;
}

export const ExperimentDebug = ({
  debugMode,
  experiment_id,
  experiment_name,
  config,
}: Props) => {
  const { values } = useFormState({
    subscription: { values: true },
  }) as { values: ExperimentFormValues };

  const debugResult = useUnit(ExperimentDebugModel.$result);
  const inputDataMode = useUnit(ExperimentDebugModel.$inputDataMode);
  const debugPending = useUnit(ExperimentDebugModel.$pending);
  const activeTab = useUnit(ExperimentDebugModel.$activeTab);

  const [showPanel, setShowPanel] = useState(false);
  const [selectedPort, setSelectedPort] = useState<string>('');
  // Store для хранения JSON строк для каждого порта
  const [portDataMap, setPortDataMap] = useState<Record<string, string>>({});

  // Автоматически открываем sidebar когда debug mode включается
  useEffect(() => {
    if (debugMode) {
      setShowPanel(true);
    }
  }, [debugMode]);

  // Получаем порты Resharder для debug data tab
  const resharderPorts = useMemo(() => {
    const ports: Array<{
      value: string;
      content: string;
      sourceName: string;
      outputName: string;
    }> = [];
    const inputSources = values?.Resharder?.InputSources;
    if (Array.isArray(inputSources)) {
      inputSources.forEach((source) => {
        // Пропускаем если оба поля пустые
        const sourceName = source.SourceName?.trim() || '';
        const outputName = source.OutputName?.trim() || '';

        if (!sourceName && !outputName) {
          return;
        }

        // Используем OutputName если есть, иначе SourceName
        const displayName = outputName || sourceName;

        ports.push({
          value: displayName,
          content: displayName,
          sourceName,
          outputName,
        });
      });
    }
    return ports;
  }, [values?.Resharder?.InputSources]);

  // Автоматически выбираем первый порт если список изменился
  useEffect(() => {
    if (resharderPorts.length > 0 && !selectedPort) {
      setSelectedPort(resharderPorts[0].value);
    } else if (resharderPorts.length === 0) {
      setSelectedPort('');
    } else if (
      selectedPort &&
      !resharderPorts.find((p) => p.value === selectedPort)
    ) {
      // Если выбранный порт больше не существует, выбираем первый
      setSelectedPort(resharderPorts[0].value);
    }
  }, [resharderPorts, selectedPort]);

  // Инициализируем пустые JSON для новых портов
  useEffect(() => {
    resharderPorts.forEach((port) => {
      if (!(port.value in portDataMap)) {
        setPortDataMap((prev) => ({
          ...prev,
          [port.value]: '{}',
        }));
      }
    });
  }, [resharderPorts, portDataMap]);

  // Обработчик изменения данных в Monaco
  const handleMonacoChange = (value: string | undefined) => {
    if (selectedPort && value !== undefined) {
      setPortDataMap((prev) => ({
        ...prev,
        [selectedPort]: value,
      }));
    }
  };

  // Открытие модального окна для редактирования данных порта
  const handleExpandEditor = () => {
    if (!selectedPort) return;

    PortDataModel.start({
      ports: resharderPorts,
      selectedPort,
      portDataMap,
      onPortChange: (portName: string) => {
        setSelectedPort(portName);
      },
      onDataChange: (portName: string, data: string) => {
        setPortDataMap((prev) => ({
          ...prev,
          [portName]: data,
        }));
      },
    });
  };

  // Форматирование YSON для текущего порта
  const handleFormatYson = () => {
    if (!selectedPort) return;

    const currentData = portDataMap[selectedPort] || '';
    const formattedData = formatYson(currentData);

    setPortDataMap((prev) => ({
      ...prev,
      [selectedPort]: formattedData,
    }));
  };

  // Формирование data_sets для manual режима
  const buildDataSets = () => {
    if (inputDataMode !== 'manual') return undefined;

    const dataItems = resharderPorts.map((port) => {
      const portData = portDataMap[port.value] || '';

      return {
        data: portData,
        source_name: port.sourceName,
        ...(port.outputName && { output_name: port.outputName }),
      };
    });

    // Возвращаем двумерный массив: один батч с несколькими портами
    return [dataItems];
  };

  const dataContent = (
    <Flex direction="column" style={{ height: '100%' }}>
      <Flex gap={5} alignItems="center" style={{ padding: '16px' }}>
        <Flex direction="row" gap={2} alignItems="center">
          <Text variant="body-1" color="secondary">
            Input data:
          </Text>
          <SegmentedRadioGroup
            value={inputDataMode}
            onUpdate={(value) =>
              ExperimentDebugModel.setInputDataMode(
                value as 'yt_sample' | 'manual',
              )
            }
            size="m"
          >
            <SegmentedRadioGroup.Option value="yt_sample" content="yt_sample" />
            <SegmentedRadioGroup.Option value="manual" content="manual" />
          </SegmentedRadioGroup>
        </Flex>
        {inputDataMode === 'manual' && resharderPorts.length > 0 && (
          <Flex
            style={{ width: 'fit-content' }}
            gap={2}
            direction="row"
            alignItems="center"
          >
            <Text variant="body-1" color="secondary">
              Input source:
            </Text>
            <Select
              size="m"
              value={[selectedPort]}
              onUpdate={(value) => setSelectedPort(value[0])}
              options={resharderPorts}
            />
          </Flex>
        )}
        {inputDataMode === 'manual' && resharderPorts.length === 0 && (
          <Text variant="body-1" color="secondary">
            Add InputSources in Resharder configuration.
          </Text>
        )}
        <Button
          view="action"
          size="m"
          onClick={() => {
            ExperimentDebugModel.start({
              experiment_id,
              name: experiment_name,
              config,
              should_read_yt_sample: inputDataMode === 'yt_sample',
              data_sets: buildDataSets(),
            });
          }}
          loading={debugPending}
          disabled={debugPending}
        >
          Run debug
        </Button>
        {inputDataMode === 'manual' && resharderPorts.length > 0 && (
          <Flex gap={2} style={{ marginLeft: 'auto' }}>
            <Button view="flat" size="m" onClick={handleFormatYson}>
              <Icon data={TextIndent} />
              format
            </Button>
            <Button view="flat" size="m" onClick={handleExpandEditor}>
              <Icon data={ChevronsExpandUpRight} />
              edit
            </Button>
          </Flex>
        )}
      </Flex>
      {inputDataMode === 'manual' && resharderPorts.length > 0 && (
        <Flex
          direction="column"
          style={{
            flex: 1,
            minHeight: 0,
            position: 'relative',
          }}
        >
          <SFMonaco
            language="yson"
            value={portDataMap[selectedPort] || '{}'}
            onChange={handleMonacoChange}
            options={{ readOnly: false }}
          />
        </Flex>
      )}
    </Flex>
  );

  const errorsContent =
    debugResult?.errors && debugResult.errors.length > 0 ? (
      <Flex direction="column" gap={2} style={{ padding: '16px' }}>
        {debugResult.errors.map((error, index) => (
          <Text key={index} variant="body-1" color="danger">
            {error}
          </Text>
        ))}
      </Flex>
    ) : (
      <Flex direction="column" style={{ padding: '16px' }}>
        <Text variant="body-1" color="secondary">
          No errors.
        </Text>
      </Flex>
    );

  const logsContent =
    debugResult?.logs && debugResult.logs.length > 0 ? (
      <LogViewer content={debugResult.logs.join('\n')} />
    ) : (
      <Flex direction="column" style={{ padding: '8px 16px' }}>
        <Text variant="body-1" color="secondary">
          No logs available.
        </Text>
      </Flex>
    );

  // Извлекаем cube_runs из результата
  const cubeRuns = useMemo<CubeRuns | null>(() => {
    if (!debugResult?.run_result) return null;

    const batchRuns = debugResult.run_result.batch_runs;
    if (!batchRuns || batchRuns.length === 0) {
      return null;
    }

    // Берем cube_runs из первого batch_run
    return batchRuns[0]?.cube_runs || null;
  }, [debugResult]);

  const cubesContent = <CubeViewer cubeRuns={cubeRuns} />;

  // Определяем какие табы показывать
  const showErrorsTab = !!debugResult?.errors && debugResult.errors.length > 0;
  const errorsCount = debugResult?.errors?.length || 0;
  const showLogsTab = !!debugResult;
  const logsCount = debugResult?.logs?.length || 0;
  const showCubesTab = !!cubeRuns && Object.keys(cubeRuns).length > 0;
  const cubesCount = cubeRuns ? Object.keys(cubeRuns).length : 0;

  return (
    <DebugSidebar
      pageId="experiment-debug-sidebar"
      showPanel={showPanel}
      togglePanel={() => setShowPanel((prev) => !prev)}
      activeTab={activeTab}
      onTabChange={(tab) => ExperimentDebugModel.setActiveTab(tab)}
      dataContent={dataContent}
      errorsContent={errorsContent}
      logsContent={logsContent}
      cubesContent={cubesContent}
      showErrorsTab={showErrorsTab}
      errorsCount={errorsCount}
      showLogsTab={showLogsTab}
      logsCount={logsCount}
      showCubesTab={showCubesTab}
      cubesCount={cubesCount}
    />
  );
};
