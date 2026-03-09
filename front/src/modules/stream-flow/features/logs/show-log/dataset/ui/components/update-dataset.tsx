import { Flex } from '@gravity-ui/uikit';
import React from 'react';

import {
  DiffRow,
  LogChangesHeader,
} from '@/modules/stream-flow/features/logs/show-log/components';
import { UpdateLogDatasetDC } from '@/modules/stream-flow/shared/api/__generated__/data-contracts';
import { DatasetDiff } from '@/modules/stream-flow/shared/types';

interface Props {
  oldData?: UpdateLogDatasetDC;
  newData?: UpdateLogDatasetDC;
  diff: DatasetDiff;
}

export const UpdateDataset: React.FC<Props> = ({ oldData, newData, diff }) => {
  return (
    <Flex direction="column" gap={0}>
      <LogChangesHeader />
      <Flex direction="column" style={{ width: '100%' }} className="" gap={4}>
        {diff.name && (
          <DiffRow
            title="Название"
            oldValue={oldData?.name ?? ''}
            newValue={newData?.name ?? ''}
          />
        )}
        {diff.managed && (
          <DiffRow
            title="Управляемый"
            oldValue={oldData?.managed ? 'true' : 'false'}
            newValue={newData?.managed ? 'true' : 'false'}
          />
        )}
        {diff.public && (
          <DiffRow
            title="Публичный"
            oldValue={oldData?.public ? 'true' : 'false'}
            newValue={newData?.public ? 'true' : 'false'}
          />
        )}
      </Flex>
    </Flex>
  );
};
