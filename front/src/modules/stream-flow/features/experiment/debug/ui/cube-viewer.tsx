import { ChevronsExpandUpRight } from '@gravity-ui/icons';
import {
  Flex,
  Icon,
  Select,
  Tab,
  TabList,
  TabProvider,
  Text,
  Button,
} from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React, { useEffect, useMemo, useState } from 'react';

import { monacoModel } from '@/modules/stream-flow/entities/monaco';
import { LogViewer } from '@/modules/stream-flow/shared/ui/log-viewer';
import { SFMonaco } from '@/modules/stream-flow/shared/ui/sf-monaco';
import { formatYson } from '@/modules/stream-flow/shared/utils/formatYson';

import * as CubeDataModel from '../cube-data/model';
import * as ExperimentDebugModel from '../model';
import { CubeRuns, CubeTabId } from '../types';

interface CubeViewerProps {
  cubeRuns: CubeRuns | null;
}

export const CubeViewer: React.FC<CubeViewerProps> = ({ cubeRuns }) => {
  const [fontSizeNumber] = useUnit([monacoModel.$fontSizeNumber]);
  const selectedCubeFromModel = useUnit(ExperimentDebugModel.$selectedCube);

  // Получаем список кубов
  const cubeNames = useMemo(() => {
    if (!cubeRuns) return [];
    return Object.keys(cubeRuns);
  }, [cubeRuns]);

  // Выбранный куб - используем из модели или первый по умолчанию
  const selectedCube = useMemo(() => {
    if (selectedCubeFromModel && cubeNames.includes(selectedCubeFromModel)) {
      return selectedCubeFromModel;
    }
    return cubeNames[0] || '';
  }, [selectedCubeFromModel, cubeNames]);

  // Обновляем выбранный куб в модели при изменении списка (если текущий выбранный не валиден)
  useEffect(() => {
    if (cubeNames.length > 0 && !cubeNames.includes(selectedCube)) {
      ExperimentDebugModel.setSelectedCube(cubeNames[0]);
    }
  }, [cubeNames, selectedCube]);

  // Активная вкладка внутри куба
  const [activeCubeTab, setActiveCubeTab] = useState<CubeTabId>('inputs');

  // Данные текущего куба
  const currentCubeData = useMemo(() => {
    if (!cubeRuns || !selectedCube) return null;
    return cubeRuns[selectedCube];
  }, [cubeRuns, selectedCube]);

  // Опции для селекта кубов
  const cubeOptions = useMemo(() => {
    return cubeNames.map((name) => ({ value: name, content: name }));
  }, [cubeNames]);

  // Опции для inputs
  const inputOptions = useMemo(() => {
    if (!currentCubeData?.inputs) return [];
    return Object.keys(currentCubeData.inputs || {}).map((key) => ({
      value: key,
      content: key,
    }));
  }, [currentCubeData]);

  // Опции для outputs
  const outputOptions = useMemo(() => {
    if (!currentCubeData?.outputs) return [];
    return Object.keys(currentCubeData.outputs || {}).map((key) => ({
      value: key,
      content: key,
    }));
  }, [currentCubeData]);

  // Счетчики для табов
  const inputsCount = inputOptions.length;
  const outputsCount = outputOptions.length;
  const logsCount = currentCubeData?.logs?.length || 0;

  // Выбранный input
  const [selectedInput, setSelectedInput] = useState<string>(
    () => inputOptions[0]?.value || '',
  );

  // Выбранный output
  const [selectedOutput, setSelectedOutput] = useState<string>(
    () => outputOptions[0]?.value || '',
  );

  // Обновляем выбранный input при изменении куба
  React.useEffect(() => {
    if (
      inputOptions.length > 0 &&
      !inputOptions.find((o) => o.value === selectedInput)
    ) {
      setSelectedInput(inputOptions[0].value);
    }
  }, [inputOptions, selectedInput]);

  // Обновляем выбранный output при изменении куба
  React.useEffect(() => {
    if (
      outputOptions.length > 0 &&
      !outputOptions.find((o) => o.value === selectedOutput)
    ) {
      setSelectedOutput(outputOptions[0].value);
    }
  }, [outputOptions, selectedOutput]);

  // Открытие модального окна для просмотра данных куба
  const handleExpandViewer = () => {
    if (!cubeRuns) return;

    CubeDataModel.start({
      cubeRuns,
      selectedCube,
    });
  };

  if (!cubeRuns || cubeNames.length === 0) {
    return (
      <Flex
        direction="column"
        alignItems="flex-start"
        gap={2}
        style={{ padding: '16px' }}
      >
        <Text variant="body-1" color="secondary">
          No cube data available.
        </Text>
      </Flex>
    );
  }

  // Рендер содержимого вкладки Inputs
  const renderInputsTab = () => {
    if (inputOptions.length === 0) {
      return (
        <Flex
          direction="column"
          alignItems="flex-start"
          gap={2}
          style={{ padding: '8px 16px' }}
        >
          <Text variant="body-1" color="secondary">
            No inputs available.
          </Text>
        </Flex>
      );
    }

    // inputs это Record<string, string>
    const inputData = currentCubeData?.inputs?.[selectedInput];
    const inputValue = formatYson(inputData || '');

    return (
      <Flex
        direction="column"
        style={{ height: '100%', gap: '8px', width: '100%' }}
      >
        <Flex
          direction="row"
          alignItems="center"
          gap={2}
          style={{ padding: '8px 16px' }}
        >
          <Text variant="body-1" color="secondary">
            Input:
          </Text>
          <Select
            size="m"
            value={[selectedInput]}
            onUpdate={(values) => setSelectedInput(values[0])}
            options={inputOptions}
            width="auto"
          />
        </Flex>
        <Flex style={{ flex: 1, minHeight: 0 }}>
          <SFMonaco
            language="yson"
            value={inputValue}
            className="monaco-viewer"
            disableSuggestions
            options={{
              readOnly: true,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              fontSize: fontSizeNumber,
            }}
          />
        </Flex>
      </Flex>
    );
  };

  // Рендер содержимого вкладки Outputs
  const renderOutputsTab = () => {
    if (outputOptions.length === 0) {
      return (
        <Flex
          direction="column"
          alignItems="flex-start"
          gap={2}
          style={{ padding: '8px 16px' }}
        >
          <Text variant="body-1" color="secondary">
            No outputs available.
          </Text>
        </Flex>
      );
    }

    // outputs это Record<string, string>
    const outputData = currentCubeData?.outputs?.[selectedOutput];
    const outputValue = formatYson(outputData || '');

    return (
      <Flex
        direction="column"
        style={{ height: '100%', gap: '8px', width: '100%' }}
      >
        <Flex
          direction="row"
          alignItems="center"
          gap={2}
          style={{ padding: '8px 16px' }}
        >
          <Text variant="body-1" color="secondary">
            Output:
          </Text>
          <Select
            size="m"
            value={[selectedOutput]}
            onUpdate={(values) => setSelectedOutput(values[0])}
            options={outputOptions}
            width="auto"
          />
        </Flex>
        <Flex style={{ flex: 1, minHeight: 0 }}>
          <SFMonaco
            language="yson"
            value={outputValue}
            className="monaco-viewer"
            disableSuggestions
            options={{
              readOnly: true,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              fontSize: fontSizeNumber,
            }}
          />
        </Flex>
      </Flex>
    );
  };

  // Рендер содержимого вкладки Logs
  const renderLogsTab = () => {
    const logs = currentCubeData?.logs || [];

    if (logs.length === 0) {
      return (
        <Flex
          direction="column"
          alignItems="flex-start"
          gap={2}
          style={{ padding: '8px 16px' }}
        >
          <Text variant="body-1" color="secondary">
            No logs available.
          </Text>
        </Flex>
      );
    }

    // Преобразуем массив строк в одну строку через \n
    const logsContent = logs.join('\n');

    return (
      <Flex style={{ height: '100%', width: '100%' }}>
        <LogViewer content={logsContent} />
      </Flex>
    );
  };

  return (
    <Flex direction="column" style={{ height: '100%' }}>
      {/* Селект куба */}

      {/* Табы внутри куба */}
      <Flex style={{ flex: 1, minHeight: 0 }}>
        <TabProvider value={activeCubeTab}>
          <Flex direction="column" style={{ width: '100%', height: '100%' }}>
            <TabList
              onUpdate={(id: string) => setActiveCubeTab(id as CubeTabId)}
              style={{ padding: '0px 18px' }}
            >
              <Flex
                direction="row"
                alignItems="center"
                gap={2}
                style={{
                  //padding: '0 0 4px 0',
                  height: '100%',
                  width: '220px',
                  marginRight: '12px',
                  paddingRight: '12px',
                  borderRight: '1px solid var(--g-color-line-generic)',
                }}
              >
                <Text variant="body-1" color="secondary">
                  Model:
                </Text>
                <Select
                  size="m"
                  value={[selectedCube]}
                  onUpdate={(values) =>
                    ExperimentDebugModel.setSelectedCube(values[0])
                  }
                  options={cubeOptions}
                  width="max"
                />
              </Flex>
              <Tab value="inputs">Inputs ({inputsCount})</Tab>
              <Tab value="outputs">Outputs ({outputsCount})</Tab>
              <Tab value="logs">Logs ({logsCount})</Tab>
              <Flex
                direction="row"
                alignItems="center"
                style={{ marginLeft: 'auto', height: '100%' }}
              >
                <Button view="flat" size="m" onClick={handleExpandViewer}>
                  <Icon data={ChevronsExpandUpRight} />
                  view
                </Button>
              </Flex>
            </TabList>
            <Flex style={{ flex: 1, minHeight: 0 }}>
              {activeCubeTab === 'inputs' && renderInputsTab()}
              {activeCubeTab === 'outputs' && renderOutputsTab()}
              {activeCubeTab === 'logs' && renderLogsTab()}
            </Flex>
          </Flex>
        </TabProvider>
      </Flex>
    </Flex>
  );
};
