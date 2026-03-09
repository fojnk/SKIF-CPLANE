import { Switch } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React from 'react';

import { monacoModel } from '@/modules/stream-flow/entities/monaco';

export const SideBySide = () => {
  const [renderSideBySide, setRenderSideBySide] = useUnit([
    monacoModel.$renderSideBySide,
    monacoModel.setRenderSideBySide,
  ]);

  return (
    <Switch
      checked={renderSideBySide}
      onUpdate={setRenderSideBySide}
      content="Side by side"
    />
  );
};
