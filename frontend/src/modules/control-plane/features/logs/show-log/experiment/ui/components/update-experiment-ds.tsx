import { Flex } from '@gravity-ui/uikit';
import React from 'react';

import {
  DiffRow,
  LogChangesHeader,
} from '@/modules/control-plane/features/logs/show-log/components';
import { UpdateLogExperimentDC } from '@/modules/control-plane/shared/api/__generated__/data-contracts';
import { ExperimentDiff } from '@/modules/control-plane/shared/types';

interface Props {
  oldData?: UpdateLogExperimentDC;
  newData?: UpdateLogExperimentDC;
  diff: ExperimentDiff;
}

export const UpdateExperimentDs: React.FC<Props> = ({
  oldData,
  newData,
  diff,
}) => {
  return (
    <Flex direction="column" gap={0}>
      <LogChangesHeader />
      <Flex direction="column" style={{ width: '100%' }} className="" gap={4}>
        {diff.dataset_alias && (
          <DiffRow
            title="Название"
            oldValue={oldData?.dataset_alias ?? ''}
            newValue={newData?.dataset_alias ?? ''}
          />
        )}
      </Flex>
    </Flex>
  );
};
