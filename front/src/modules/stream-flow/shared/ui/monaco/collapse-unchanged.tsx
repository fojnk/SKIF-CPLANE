import { Switch } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React from 'react';

import { monacoModel } from '@/modules/stream-flow/entities/monaco';

export const CollapseUnchanged = () => {
  const [collapseUnchangedRegions, setCollapseUnchangedRegions] = useUnit([
    monacoModel.$collapseUnchangedRegions,
    monacoModel.setCollapseUnchangedRegions,
  ]);

  return (
    <Switch
      checked={collapseUnchangedRegions}
      onUpdate={setCollapseUnchangedRegions}
      content="Collapse unchanged"
    />
  );
};
