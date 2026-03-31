import {
  Button,
  Dialog,
  Flex,
  Select,
  Tab,
  TabList,
  TabProvider,
  Text,
} from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React, { useEffect, useMemo, useState } from 'react';

import { monacoModel } from '@/modules/control-plane/entities/monaco';
import { LogViewer } from '@/modules/control-plane/shared/ui/log-viewer';
import { ModalControls } from '@/modules/control-plane/shared/ui/monaco';
import {
  MonacoDialogWrapper,
  SFMonaco,
} from '@/modules/control-plane/shared/ui/sf-monaco';
import { formatYson } from '@/modules/control-plane/shared/utils/formatYson';
import { ModalViewProps } from '@/shared/ui/modals';

import { CubeRuns, CubeTabId } from '../types';

export interface CubeDataModalPayload {
  cubeRuns: CubeRuns;
  selectedCube?: string;
}

export const CubeDataModal = ({
  open,
  onClose,
  payload,
  reset,
}: ModalViewProps<CubeDataModalPayload>) => {
  const [fontSizeNumber] = useUnit([monacoModel.$fontSizeNumber]);

  // Получаем список кубов
  const cubeNames = useMemo(() => {
    return Object.keys(payload.cubeRuns);
  }, [payload.cubeRuns]);

  // Выбранный куб
  const [selectedCube, setSelectedCube] = useState<string>(
    () => payload.selectedCube || cubeNames[0] || '',
  );

  // Активная вкладка
  const [activeCubeTab, setActiveCubeTab] = useState<CubeTabId>('inputs');

  // Данные текущего куба
  const currentCubeData = useMemo(() => {
    if (!selectedCube) return null;
    return payload.cubeRuns[selectedCube];
  }, [payload.cubeRuns, selectedCube]);

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
  useEffect(() => {
    if (
      inputOptions.length > 0 &&
      !inputOptions.find((o) => o.value === selectedInput)
    ) {
      setSelectedInput(inputOptions[0].value);
    }
  }, [inputOptions, selectedInput]);

  // Обновляем выбранный output при изменении куба
  useEffect(() => {
    if (
      outputOptions.length > 0 &&
      !outputOptions.find((o) => o.value === selectedOutput)
    ) {
      setSelectedOutput(outputOptions[0].value);
    }
  }, [outputOptions, selectedOutput]);

  const handleClose = () => {
    onClose();
  };

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
    <Dialog
      open={open}
      onClose={handleClose}
      onTransitionOutComplete={reset}
      size="l"
      className="variable-dialog"
    >
      <Dialog.Header
        caption={
          <Flex direction="row" alignItems="center" gap={2}>
            <Text variant="body-1">Model:</Text>
            <Select
              size="m"
              value={[selectedCube]}
              onUpdate={(values) => setSelectedCube(values[0])}
              options={cubeOptions}
            />
          </Flex>
        }
      />
      <Dialog.Body>
        <Flex
          direction="column"
          style={{ height: '100%', position: 'relative' }}
        >
          <MonacoDialogWrapper style={{ position: 'absolute', inset: 0 }}>
            <TabProvider value={activeCubeTab}>
              <Flex
                direction="column"
                style={{ width: '100%', height: '100%' }}
              >
                <TabList
                  onUpdate={(id: string) => setActiveCubeTab(id as CubeTabId)}
                >
                  <Tab value="inputs">Inputs ({inputsCount})</Tab>
                  <Tab value="outputs">Outputs ({outputsCount})</Tab>
                  <Tab value="logs">Logs ({logsCount})</Tab>
                </TabList>
                <Flex style={{ flex: 1, minHeight: 0 }}>
                  {activeCubeTab === 'inputs' && renderInputsTab()}
                  {activeCubeTab === 'outputs' && renderOutputsTab()}
                  {activeCubeTab === 'logs' && renderLogsTab()}
                </Flex>
              </Flex>
            </TabProvider>
          </MonacoDialogWrapper>
        </Flex>
      </Dialog.Body>
      <Dialog.Footer>
        <Flex
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          style={{ width: '100%' }}
        >
          <ModalControls showCollapseUnchanged={false} showSideBySide={false} />
          <Button view="normal" size="l" onClick={handleClose}>
            Close
          </Button>
        </Flex>
      </Dialog.Footer>
    </Dialog>
  );
};
