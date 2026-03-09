import { Gear } from '@gravity-ui/icons';
import { Button } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React from 'react';

import { ChangeFormParamsSettingsModel } from '@/modules/stream-flow/features/settings/form-params/change';

export const FormSettingsButton = () => {
  const [openSettings] = useUnit([ChangeFormParamsSettingsModel.start]);

  const handleClick = () => {
    openSettings({});
  };

  return (
    <Button onClick={handleClick} width="auto">
      <Button.Icon>
        <Gear />
      </Button.Icon>
      Form
    </Button>
  );
};
