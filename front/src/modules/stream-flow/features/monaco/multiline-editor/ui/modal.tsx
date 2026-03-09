import { Button, Dialog, Flex, Label, Text } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React, { useEffect, useMemo, useState } from 'react';

import { monacoModel } from '@/modules/stream-flow/entities/monaco';
import { MultilineEditorPayload } from '@/modules/stream-flow/features/monaco/multiline-editor/types';
import { ModalControls } from '@/modules/stream-flow/shared/ui/monaco';
import {
  MonacoDialogWrapper,
  SFMonaco,
} from '@/modules/stream-flow/shared/ui/sf-monaco';
import { getEditorLanguageTheme } from '@/modules/stream-flow/shared/utils/variablesHelpers';
import { ModalViewProps } from '@/shared/ui/modals';

export const Modal = ({
  open,
  onClose,
  payload,
  reset,
}: ModalViewProps<MultilineEditorPayload>) => {
  const [fontSizeNumber] = useUnit([monacoModel.$fontSizeNumber]);
  const [editedValue, setEditedValue] = useState<string>(payload.value);

  // Синхронизируем значение при изменении payload (например, при переиспользовании модалки)
  useEffect(() => {
    setEditedValue(payload.value);
  }, [payload.value]);

  // Проверка на наличие изменений
  const hasChanges = useMemo(() => {
    return editedValue !== payload.value;
  }, [editedValue, payload.value]);

  const handleValueChange = (value: string | undefined) => {
    setEditedValue(value || '');
  };

  const isViewMode = !payload.onSave;

  const handleSave = () => {
    if (hasChanges && payload.onSave) {
      payload.onSave(editedValue);
    }
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  // Для json и yql отключаем подсказки
  const disableSuggestions =
    payload.language === 'json' || payload.language === 'yql';

  // Название языка для label
  const languageLabel = useMemo(() => {
    switch (payload.language) {
      case 'json':
        return 'JSON';
      case 'yaml':
        return 'YAML';
      case 'python':
        return 'Python';
      case 'yql':
        return 'YQL';
      case 'plaintext':
        return 'Plain Text';
    }
  }, [payload.language]);

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
              {isViewMode ? '' : ' (Edit)'}
            </Text>
            <Label theme={getEditorLanguageTheme(payload.language)} size="xs">
              {languageLabel}
            </Label>
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
              language={payload.language}
              value={editedValue}
              onChange={isViewMode ? undefined : handleValueChange}
              className="monaco-viewer"
              disableSuggestions={disableSuggestions}
              options={{
                readOnly: isViewMode,
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
            {isViewMode ? (
              <Button size="l" view="outlined" onClick={onClose}>
                Close
              </Button>
            ) : (
              <>
                <Button size="l" view="outlined" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button
                  size="l"
                  view="action"
                  onClick={handleSave}
                  disabled={!hasChanges}
                >
                  Apply changes
                </Button>
              </>
            )}
          </Flex>
        </Flex>
      </Dialog.Footer>
    </Dialog>
  );
};
