import { CircleExclamationFill } from '@gravity-ui/icons';
import { Button, Dialog, Flex, Text } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React, { useMemo, useState } from 'react';

import { monacoModel } from '@/modules/control-plane/entities/monaco';
import { CustomParamPayload } from '@/modules/control-plane/features/custom-param/types';
import { ModalControls } from '@/modules/control-plane/shared/ui/monaco';
import {
  MonacoDialogWrapper,
  SFMonaco,
} from '@/modules/control-plane/shared/ui/sf-monaco';
import { formatData } from '@/modules/control-plane/shared/utils/formatData';
import { ModalViewProps } from '@/shared/ui/modals';

export const Modal = ({
  open,
  onClose,
  payload,
  reset,
}: ModalViewProps<CustomParamPayload>) => {
  const [fontSizeNumber] = useUnit([monacoModel.$fontSizeNumber]);
  const [editedValue, setEditedValue] = useState<string>(payload.value);

  const isEditMode = payload.mode === 'edit';

  const formattedValue = useMemo(() => {
    try {
      return formatData(payload.value);
    } catch {
      return payload.value;
    }
  }, [payload.value]);

  // Проверка валидности JSON
  const isValidJson = useMemo(() => {
    if (!editedValue.trim()) {
      return true; // Пустая строка считается валидной
    }
    try {
      JSON.parse(editedValue);
      return true;
    } catch {
      return false;
    }
  }, [editedValue]);

  // Проверка на наличие изменений
  const hasChanges = useMemo(() => {
    return editedValue !== payload.value;
  }, [editedValue, payload.value]);

  // Кнопка Save активна только если есть изменения и JSON валидный
  const canSave = hasChanges && isValidJson;

  const handleValueChange = (value: string | undefined) => {
    setEditedValue(value || '');
  };

  const handleSave = () => {
    if (payload.onSave && canSave) {
      payload.onSave(editedValue);
    }
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  const displayValue = isEditMode ? editedValue : formattedValue;

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
          <Flex direction="row" alignItems="center" gap={2}>
            <Text variant="subheader-2">
              {payload.paramName}
              {isEditMode ? ' (Edit)' : ''}
            </Text>
            {isEditMode && !isValidJson && (
              <Text variant="body-1" color="danger">
                <Flex
                  direction="row"
                  gap={1}
                  alignItems="center"
                  style={{ paddingLeft: '10px' }}
                >
                  <CircleExclamationFill />
                  invalid json
                </Flex>
              </Text>
            )}
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
              language="json"
              value={displayValue}
              onChange={isEditMode ? handleValueChange : undefined}
              className="monaco-viewer"
              disableSuggestions
              options={{
                readOnly: !isEditMode,
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
          gap={2}
          style={{ width: '100%' }}
        >
          <ModalControls showSideBySide={false} showCollapseUnchanged={false} />
          <Flex direction="row" gap={2}>
            {isEditMode ? (
              <>
                <Button size="l" view="outlined" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button
                  size="l"
                  view="action"
                  onClick={handleSave}
                  disabled={!canSave}
                >
                  Apply changes
                </Button>
              </>
            ) : (
              <Button size="l" view="outlined" onClick={onClose}>
                Close
              </Button>
            )}
          </Flex>
        </Flex>
      </Dialog.Footer>
    </Dialog>
  );
};
