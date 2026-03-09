import { useUnit } from 'effector-react';
import React from 'react';

import { editorPageModel } from '@/modules/control-plane/pages/editor';

import { EditorJson } from '../../components/editor-json';
import { EditorLayout } from '../../components/editor-layout';

export const DatasetSchema = () => {
  const [data, currentConfig, updateDataset] = useUnit([
    editorPageModel.editor.$data,
    editorPageModel.editor.$currentConfig,
    editorPageModel.dataSource.updateDataset,
  ]);

  const handleSave = () => {
    if (data?.id) {
      updateDataset({ id: data.id, schema: currentConfig });
    }
  };

  return (
    <EditorLayout onSave={handleSave}>
      <EditorJson />
    </EditorLayout>
  );
};
