import { useUnit } from 'effector-react';
import React from 'react';

import { editorPageModel } from '@/modules/control-plane/pages/editor';

import { EditorJson } from '../../components/editor-json';
import { EditorLayout } from '../../components/editor-layout';

export const Namespace = () => {
  const [data, currentConfig, updateNamespace] = useUnit([
    editorPageModel.editor.$data,
    editorPageModel.editor.$currentConfig,
    editorPageModel.namespace.updateNamespace,
  ]);

  const handleSave = () => {
    if (data?.id) {
      updateNamespace({ id: data.id, config: currentConfig });
    }
  };

  return (
    <EditorLayout onSave={handleSave}>
      <EditorJson />
    </EditorLayout>
  );
};
