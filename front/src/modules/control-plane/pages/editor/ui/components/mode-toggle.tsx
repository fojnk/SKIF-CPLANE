import { useUnit } from 'effector-react';
import React from 'react';

import { editorPageModel } from '@/modules/control-plane/pages/editor';
import { CodeToggle, CodeToggleMode } from '@/modules/control-plane/shared/ui';

export const ModeToggle = () => {
  const [queryParams, pending, setMode, info] = useUnit([
    editorPageModel.query.$queryParams,
    editorPageModel.loaders.$pending,
    editorPageModel.query.mode.set,
    editorPageModel.editor.$info,
  ]);

  const currentMode = queryParams.mode || 'code';

  const handleModeChange = (mode: CodeToggleMode) => {
    setMode(mode);
  };

  return (
    <CodeToggle
      value={currentMode}
      onUpdate={handleModeChange}
      disabled={pending || info.invalidJson}
      disabledReason={
        pending ? 'loading' : info.invalidJson ? 'invalidJson' : undefined
      }
      size="m"
    />
  );
};
