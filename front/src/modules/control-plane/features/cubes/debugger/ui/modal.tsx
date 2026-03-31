import {
  Button,
  Dialog,
  Flex,
  Tab,
  TabList,
  TabProvider,
  Text,
} from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React, { useMemo, useState } from 'react';

import type { DebugMessage } from '@/modules/control-plane/entities/cubes';
import { monacoModel } from '@/modules/control-plane/entities/monaco';
import { ModalControls } from '@/modules/control-plane/shared/ui/monaco';
import {
  MonacoDialogWrapper,
  SFMonaco,
} from '@/modules/control-plane/shared/ui/sf-monaco';
import { formatData } from '@/modules/control-plane/shared/utils/formatData';
import { ModalViewProps } from '@/shared/ui/modals';

import { CubesDebuggerPayload } from '../types';

type TabId = 'summary' | 'debug' | 'config' | 'additional' | 'graph';
type CurrentTabId = 'config' | 'additional' | 'graph';

// ============================================================================
// Summary Tab Content
// ============================================================================

interface DebugMessageItemProps {
  message: DebugMessage;
}

const DebugMessageItem = ({ message }: DebugMessageItemProps) => {
  // Определяем цвет в зависимости от уровня
  const getColor = () => {
    switch (message.level) {
      case 'error':
        return 'danger';
      case 'warning':
        return 'warning';
      case 'info':
        return 'positive';
      default:
        return 'secondary';
    }
  };

  // Определяем иконку/префикс в зависимости от уровня
  const getPrefix = () => {
    switch (message.level) {
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return '✓';
      default:
        return '•';
    }
  };

  // Форматируем stage для отображения
  const formatStage = (stage: string) => {
    return stage.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <Flex direction="column" gap={1} style={{ marginBottom: '12px' }}>
      <Flex direction="row" alignItems="center" gap={2}>
        <Text variant="body-1" color={getColor()}>
          {getPrefix()}
        </Text>
        <Text variant="body-1" color={getColor()}>
          {message.message}
        </Text>
      </Flex>
      <Text
        variant="caption-1"
        color="secondary"
        style={{ marginLeft: '20px' }}
      >
        Stage: {formatStage(message.stage)}
      </Text>
      {message.details !== undefined && message.details !== null && (
        <Text
          variant="code-1"
          color="secondary"
          style={{
            marginLeft: '20px',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {typeof message.details === 'string'
            ? message.details
            : JSON.stringify(message.details as object, null, 2)}
        </Text>
      )}
    </Flex>
  );
};

interface SummaryTabContentProps {
  payload: CubesDebuggerPayload;
}

const SummaryTabContent = ({ payload }: SummaryTabContentProps) => {
  const { debugInfo } = payload;

  if (!debugInfo || debugInfo.messages.length === 0) {
    return (
      <Flex
        direction="column"
        alignItems="center"
        justifyContent="center"
        style={{ height: '100%', padding: '40px' }}
      >
        <Text variant="body-1" color="positive">
          ✓ No issues found
        </Text>
        <Text
          variant="caption-1"
          color="secondary"
          style={{ marginTop: '8px' }}
        >
          Config parsed successfully
        </Text>
      </Flex>
    );
  }

  // Группируем сообщения по уровню
  const errorMessages = debugInfo.messages.filter((m) => m.level === 'error');
  const warningMessages = debugInfo.messages.filter(
    (m) => m.level === 'warning',
  );
  const infoMessages = debugInfo.messages.filter((m) => m.level === 'info');

  return (
    <Flex
      direction="column"
      style={{ height: '100%', overflow: 'auto', padding: '8px 0' }}
    >
      {/* Summary header */}
      <Flex
        direction="row"
        gap={4}
        style={{
          marginBottom: '16px',
          paddingBottom: '12px',
          borderBottom: '1px solid var(--g-color-line-generic)',
        }}
      >
        {errorMessages.length > 0 && (
          <Text variant="body-1" color="danger">
            {errorMessages.length} error(s)
          </Text>
        )}
        {warningMessages.length > 0 && (
          <Text variant="body-1" color="warning">
            {warningMessages.length} warning(s)
          </Text>
        )}
        {infoMessages.length > 0 && (
          <Text variant="body-1" color="positive">
            {infoMessages.length} info
          </Text>
        )}
      </Flex>

      {/* Errors */}
      {errorMessages.length > 0 && (
        <Flex direction="column" style={{ marginBottom: '16px' }}>
          <Text
            variant="subheader-1"
            color="danger"
            style={{ marginBottom: '8px' }}
          >
            Errors
          </Text>
          {errorMessages.map((msg, idx) => (
            <DebugMessageItem key={`error-${idx}`} message={msg} />
          ))}
        </Flex>
      )}

      {/* Warnings */}
      {warningMessages.length > 0 && (
        <Flex direction="column" style={{ marginBottom: '16px' }}>
          <Text
            variant="subheader-1"
            color="warning"
            style={{ marginBottom: '8px' }}
          >
            Warnings
          </Text>
          {warningMessages.map((msg, idx) => (
            <DebugMessageItem key={`warning-${idx}`} message={msg} />
          ))}
        </Flex>
      )}

      {/* Info */}
      {infoMessages.length > 0 && (
        <Flex direction="column">
          <Text
            variant="subheader-1"
            color="positive"
            style={{ marginBottom: '8px' }}
          >
            Info
          </Text>
          {infoMessages.map((msg, idx) => (
            <DebugMessageItem key={`info-${idx}`} message={msg} />
          ))}
        </Flex>
      )}
    </Flex>
  );
};

// ============================================================================
// Main Modal
// ============================================================================

export const Modal = ({
  open,
  onClose,
  payload,
  reset,
}: ModalViewProps<CubesDebuggerPayload>) => {
  const isCurrentMode = payload.mode === 'current';
  const [activeTab, setActiveTab] = useState<TabId | CurrentTabId>(
    isCurrentMode ? 'config' : 'summary',
  );
  const [fontSizeNumber] = useUnit([monacoModel.$fontSizeNumber]);

  // Форматируем данные для каждого таба
  const debugContent = useMemo(() => {
    if (!payload.debugInfo) return '';
    return formatData(JSON.stringify(payload.debugInfo));
  }, [payload.debugInfo]);

  const configContent = useMemo(() => {
    return formatData(payload.cubesConfigJson);
  }, [payload.cubesConfigJson]);

  const additionalContent = useMemo(() => {
    return formatData(payload.cubeConfigJson);
  }, [payload.cubeConfigJson]);

  const graphContent = useMemo(() => {
    return formatData(payload.graphDataJson);
  }, [payload.graphDataJson]);

  // Заголовок для таба Summary (без количества ошибок в названии)
  const summaryTitle = 'Summary';

  // Заголовок модалки в зависимости от режима
  const modalTitle = isCurrentMode
    ? 'Models Debugger — Current'
    : 'Models Debugger — Initial';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      onTransitionOutComplete={reset}
      size="l"
      disableEscapeKeyDown
      disableOutsideClick
      className="variable-dialog"
    >
      <Dialog.Header caption={modalTitle} />
      <Dialog.Body>
        <TabProvider
          value={activeTab}
          onUpdate={(value) => setActiveTab(value as TabId)}
        >
          <Flex direction="column" style={{ height: '100%' }}>
            <TabList size="m" style={{ marginBottom: '12px' }}>
              {isCurrentMode ? (
                <>
                  <Tab value="config">Current Models Config</Tab>
                  <Tab value="additional">Current Additional Info</Tab>
                  <Tab value="graph">Current Graph Config</Tab>
                </>
              ) : (
                <>
                  <Tab value="summary">{summaryTitle}</Tab>
                  <Tab value="debug">Debug JSON</Tab>
                  <Tab value="config">Initial Models Config</Tab>
                  <Tab value="additional">Initial Additional Info</Tab>
                  <Tab value="graph">Initial Graph Config</Tab>
                </>
              )}
            </TabList>
            <Flex
              direction="column"
              style={{ flex: 1, position: 'relative', minHeight: 0 }}
            >
              {activeTab === 'summary' && !isCurrentMode ? (
                <SummaryTabContent payload={payload} />
              ) : (
                <MonacoDialogWrapper style={{ position: 'absolute', inset: 0 }}>
                  <SFMonaco
                    language="json"
                    value={
                      activeTab === 'debug'
                        ? debugContent
                        : activeTab === 'config'
                          ? configContent
                          : activeTab === 'additional'
                            ? additionalContent
                            : graphContent
                    }
                    className="monaco-viewer"
                    options={{
                      readOnly: true,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      fontSize: fontSizeNumber,
                    }}
                  />
                </MonacoDialogWrapper>
              )}
            </Flex>
          </Flex>
        </TabProvider>
      </Dialog.Body>
      <Dialog.Footer>
        <Flex
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          gap={2}
          style={{ width: '100%' }}
        >
          <ModalControls showSideBySide={false} showCollapseUnchanged={false} />
          <Button view="outlined" onClick={onClose}>
            Close
          </Button>
        </Flex>
      </Dialog.Footer>
    </Dialog>
  );
};
