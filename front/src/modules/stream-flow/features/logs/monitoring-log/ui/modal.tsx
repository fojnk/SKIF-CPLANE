import { Dialog, Flex, Text } from '@gravity-ui/uikit';
import React from 'react';

import { ShowLogPayload } from '@/modules/stream-flow/features/logs/monitoring-log';
import {
  MonacoDialogWrapper,
  SFMonaco,
} from '@/modules/stream-flow/shared/ui/sf-monaco';
import { formatData } from '@/modules/stream-flow/shared/utils/formatData';
import { ModalViewProps } from '@/shared/ui/modals';

export const Modal = ({
  open,
  onClose,
  payload,
  reset,
}: ModalViewProps<ShowLogPayload>) => {
  // Проверяем валидность JSON и форматируем данные
  const formattedLog = React.useMemo(() => {
    if (payload.logType === 'json') {
      return formatData(payload.log);
    }
    return payload.log;
  }, [payload.log, payload.logType]);

  // Определяем язык для Monaco Editor
  const language = React.useMemo(() => {
    if (payload.logType === 'json') {
      try {
        JSON.parse(payload.log);
        return 'json';
      } catch {
        // Если JSON невалидный, показываем как plaintext
        return 'plaintext';
      }
    }
    return payload.logType;
  }, [payload.log, payload.logType]);

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
      <Dialog.Header
        caption={
          <Flex
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Text variant="subheader-2">{payload.title}</Text>
          </Flex>
        }
      />
      <Dialog.Body>
        <MonacoDialogWrapper style={{ height: '100%' }}>
          <SFMonaco
            language={language}
            value={formattedLog}
            className="monaco-viewer"
            options={{
              readOnly: true,
            }}
          />
        </MonacoDialogWrapper>
      </Dialog.Body>
    </Dialog>
  );
};
