import { Gear } from '@gravity-ui/icons';
import { Button } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React from 'react';

import { ChangeLogViewerSettingsModel } from '@/modules/control-plane/features/settings/log-viewer/change';

export const MonitoringSettingsButton = () => {
  const [openSettings] = useUnit([ChangeLogViewerSettingsModel.start]);

  const handleClick = () => {
    openSettings({});
  };

  return (
    <Button onClick={handleClick} width="auto">
      <Button.Icon>
        <Gear />
      </Button.Icon>
      Settings
    </Button>
  );
};
