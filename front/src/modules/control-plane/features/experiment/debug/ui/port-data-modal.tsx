import { TextIndent } from '@gravity-ui/icons';
import {
  Button,
  Dialog,
  Flex,
  Icon,
  Label,
  Select,
  Text,
} from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React, { useEffect, useState } from 'react';

import { monacoModel } from '@/modules/control-plane/entities/monaco';
import { ModalControls } from '@/modules/control-plane/shared/ui/monaco';
import {
  MonacoDialogWrapper,
  SFMonaco,
} from '@/modules/control-plane/shared/ui/sf-monaco';
import { formatYson } from '@/modules/control-plane/shared/utils/formatYson';
import { ModalViewProps } from '@/shared/ui/modals';

import { PortDataModalPayload } from '../types';

export const PortDataModal = ({
  open,
  onClose,
  payload,
  reset,
}: ModalViewProps<PortDataModalPayload>) => {
  const [fontSizeNumber] = useUnit([monacoModel.$fontSizeNumber]);
  const [currentPort, setCurrentPort] = useState<string>(payload.selectedPort);
  const [editedValue, setEditedValue] = useState<string>(
    payload.portDataMap[payload.selectedPort] || '{}',
  );

  // Синхронизируем editedValue при изменении порта
  useEffect(() => {
    setEditedValue(payload.portDataMap[currentPort] || '{}');
  }, [currentPort, payload.portDataMap]);

  const handleValueChange = (value: string | undefined) => {
    const newValue = value || '';
    setEditedValue(newValue);
    // Транслируем изменения сразу
    if (payload.onDataChange) {
      payload.onDataChange(currentPort, newValue);
    }
  };

  const handlePortChange = (ports: string[]) => {
    const newPort = ports[0];
    setCurrentPort(newPort);
    if (payload.onPortChange) {
      payload.onPortChange(newPort);
    }
  };

  const handleClose = () => {
    onClose();
  };

  const handleFormatYson = () => {
    const formattedData = formatYson(editedValue);
    setEditedValue(formattedData);
    if (payload.onDataChange) {
      payload.onDataChange(currentPort, formattedData);
    }
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
          <Flex direction="row" alignItems="center" gap={5}>
            <Flex direction="row" alignItems="center" gap={2}>
              <Text variant="body-1">Input source:</Text>
              <Select
                size="m"
                value={[currentPort]}
                onUpdate={handlePortChange}
                options={payload.ports}
              />
            </Flex>
            <Label size="xs" theme="warning">
              YSON
            </Label>
            <Button view="flat" size="m" onClick={handleFormatYson}>
              <Icon data={TextIndent} />
              format
            </Button>
          </Flex>
        }
      />
      <Dialog.Body>
        <Flex
          direction="column"
          style={{ height: '100%', position: 'relative' }}
        >
          <MonacoDialogWrapper style={{ position: 'absolute', inset: 0 }}>
            <SFMonaco
              language="yson"
              value={editedValue}
              onChange={handleValueChange}
              className="monaco-viewer"
              disableSuggestions
              options={{
                readOnly: false,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                fontSize: fontSizeNumber,
              }}
            />
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
