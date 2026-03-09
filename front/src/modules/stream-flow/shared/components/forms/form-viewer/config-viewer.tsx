import { Pencil } from '@gravity-ui/icons';
import { Button, Flex } from '@gravity-ui/uikit';
import React, { useMemo, useState } from 'react';

import {
  CodeToggle,
  CodeToggleMode,
  FormSettingsButton,
} from '@/modules/stream-flow/shared/ui';
import { SFMonaco } from '@/modules/stream-flow/shared/ui/sf-monaco';
import {
  getCodeToggleMode,
  saveCodeToggleMode,
} from '@/modules/stream-flow/shared/utils/pageDataHelpers';

interface Props {
  data: string | null | undefined;
  onEditClick?: (mode: CodeToggleMode) => void;
  canEdit?: boolean;
  afterButtons?: React.ReactNode;
  beforeButtons?: React.ReactNode;
  showCodeToggle?: boolean;
  onModeChange?: (mode: CodeToggleMode) => void;
  configForm?: React.ReactNode;
}

export const ConfigViewer = ({
  data,
  onEditClick,
  canEdit = false,
  afterButtons,
  beforeButtons,
  showCodeToggle = false,
  onModeChange,
  configForm,
}: Props) => {
  const [mode, setMode] = useState<CodeToggleMode>(() => getCodeToggleMode());

  const handleModeChange = (newMode: CodeToggleMode) => {
    setMode(newMode);
    saveCodeToggleMode(newMode);
    onModeChange?.(newMode);
  };
  // Форматируем JSON для отображения в режиме просмотра
  const { formattedData, isValidJson } = useMemo(() => {
    if (!data) return { formattedData: '', isValidJson: true };
    try {
      const parsed = JSON.parse(data);
      return {
        formattedData: JSON.stringify(parsed, null, 2),
        isValidJson: true,
      };
    } catch {
      // Если не валидный JSON, возвращаем как есть
      return {
        formattedData: data,
        isValidJson: false,
      };
    }
  }, [data]);
  const formStyle: React.CSSProperties = {
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
    position: 'relative',
  };
  const showButtons = Boolean(
    beforeButtons || showCodeToggle || afterButtons || (onEditClick && canEdit),
  );

  return (
    <Flex
      direction="column"
      gapRow={4}
      className="monaco-viewer sf-l-pt"
      style={{ flex: 1, minHeight: 0 }}
    >
      {showButtons && (
        <Flex
          direction="row"
          className="sf-l-pl sf-l-pr"
          gap={2}
          justifyContent="space-between"
        >
          <Flex gap={2} direction="row">
            {beforeButtons}
            {showCodeToggle && (
              <CodeToggle
                value={mode}
                onUpdate={handleModeChange}
                size="m"
                disabled={!isValidJson || !configForm}
                disabledReason={
                  !isValidJson
                    ? 'invalidJson'
                    : !configForm
                      ? 'noForm'
                      : undefined
                }
              />
            )}
            {onEditClick && canEdit && (
              <Button
                onClick={() => onEditClick(showCodeToggle ? mode : 'code')}
                width="auto"
              >
                <Button.Icon>
                  <Pencil />
                </Button.Icon>
                Edit
              </Button>
            )}
            {afterButtons}
          </Flex>
          {showCodeToggle && mode === 'form' && <FormSettingsButton />}
        </Flex>
      )}

      {mode === 'code' || !isValidJson || !configForm ? (
        <SFMonaco
          language="json"
          value={formattedData}
          className="monaco-viewer"
          options={{
            readOnly: true,
          }}
        />
      ) : (
        <div style={formStyle}>{configForm}</div>
      )}
    </Flex>
  );
};
