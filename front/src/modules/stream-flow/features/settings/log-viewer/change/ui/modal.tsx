import { Button, Dialog, Flex, Select, Switch, Text } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React from 'react';

import {
  $settings,
  FONT_SIZE_OPTIONS,
  resetSettings,
  updateSettings,
} from '@/modules/stream-flow/entities/log-viewer';
import type { ModalViewProps } from '@/shared/ui/modals';

import type { ChangeLogViewerSettingsPayload } from '../model';

export const ChangeLogViewerSettingsModal = ({
  open,
  onClose,
  reset,
}: ModalViewProps<ChangeLogViewerSettingsPayload>) => {
  const settings = useUnit($settings);

  const handleAlwaysDarkThemeChange = (checked: boolean) => {
    // Применяем изменения сразу
    updateSettings({ alwaysDarkTheme: checked });
  };

  const handleFontSizeChange = (value: string[]) => {
    // Применяем изменения сразу
    updateSettings({ fontSize: value[0] });
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
      resetSettings();
    }
  };

  return (
    <Dialog
      onTransitionOutComplete={reset}
      open={open}
      onClose={onClose}
      size="s"
      className="sf-dialog"
    >
      <Dialog.Header caption="Monitoring Settings" />
      <Dialog.Body>
        <Flex direction="column" gap={4}>
          <Flex direction="column" gap={2}>
            <Text variant="subheader-2">Log Viewer</Text>
            <Flex direction="row" gap={4}>
              <Flex direction="row" alignItems="center" gap={2}>
                <Text variant="subheader-1">Font size:</Text>
                <Select
                  value={[settings.fontSize]}
                  onUpdate={handleFontSizeChange}
                  options={[...FONT_SIZE_OPTIONS]}
                  size="m"
                  width={100}
                />
              </Flex>
              <Flex direction="row" alignItems="center" gap={3}>
                <Switch
                  size="l"
                  checked={settings.alwaysDarkTheme}
                  onUpdate={handleAlwaysDarkThemeChange}
                  content="Always dark theme"
                />
              </Flex>
            </Flex>
          </Flex>
        </Flex>
      </Dialog.Body>
      <Dialog.Footer>
        <Flex
          direction="row"
          gap={2}
          justifyContent="space-between"
          style={{ width: '100%' }}
        >
          <Button view="outlined-danger" onClick={handleReset}>
            Reset to Defaults
          </Button>
          <Button view="outlined" onClick={onClose}>
            Close
          </Button>
        </Flex>
      </Dialog.Footer>
    </Dialog>
  );
};
