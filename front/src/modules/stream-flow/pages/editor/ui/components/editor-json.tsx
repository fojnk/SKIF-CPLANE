import { useUnit } from 'effector-react';
import React from 'react';

import { editorPageModel } from '@/modules/stream-flow/pages/editor';
import { SFMonaco } from '@/modules/stream-flow/shared/ui/sf-monaco';

export const EditorJson = () => {
  const [currentConfig, setCurrentConfig, schema, pending] = useUnit([
    editorPageModel.editor.$currentConfig,
    editorPageModel.editor.setCurrentConfig,
    editorPageModel.schema.$data,
    editorPageModel.loaders.$pending,
  ]);

  return (
    <SFMonaco
      language="json"
      value={currentConfig || ''}
      onChange={(value) => setCurrentConfig(value || '')}
      className="editor-page-monaco"
      options={{
        readOnly: pending,
      }}
      schema={schema ?? undefined}
    />
  );
};
