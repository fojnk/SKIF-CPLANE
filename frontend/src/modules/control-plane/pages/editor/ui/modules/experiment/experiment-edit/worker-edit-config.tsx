import { Text } from '@gravity-ui/uikit';
import React from 'react';

import { FormParamEdit } from '@/modules/control-plane/shared/components/forms';
import { ParamsDC } from '@/modules/control-plane/shared/types';
import { ResizablePanel } from '@/modules/control-plane/shared/ui/resizer';

import { getWorkerParam, getWorkerStructParams } from './utils';
import { WorkerEditConfigCubes } from './worker-edit-cubes';

interface Props {
  formData: ParamsDC[];
  selectedCubeHash?: string | null;
  /** Список имён доступных переменных для валидации ${variableName} */
  variableNames?: Set<string>;
}

export const WorkerEditConfig = ({
  formData,
  selectedCubeHash,
  variableNames,
}: Props) => {
  const workerParam = getWorkerParam(formData);
  const sortedParams = getWorkerStructParams(formData);

  return (
    <ResizablePanel
      pageId="experiment-edit-worker-config-size"
      resizerPosition="left"
      header={<Text variant="subheader-2">Worker</Text>}
    >
      {!workerParam || sortedParams.length === 0 ? (
        <Text variant="subheader-1" color="secondary">
          Empty config
        </Text>
      ) : (
        <>
          <FormParamEdit
            params={sortedParams}
            fieldNamePrefix="Worker"
            size="m"
            disclosure
            addButtonVariant="normal"
            variableNames={variableNames}
          />
          <WorkerEditConfigCubes
            selectedCubeHash={selectedCubeHash}
            variableNames={variableNames}
          />
        </>
      )}
    </ResizablePanel>
  );
};
