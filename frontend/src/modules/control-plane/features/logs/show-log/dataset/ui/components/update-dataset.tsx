import { Flex } from '@gravity-ui/uikit';
import React from 'react';

import {
  DiffRow,
  LogChangesHeader,
} from '@/modules/control-plane/features/logs/show-log/components';
import { UpdateLogDatasetDC } from '@/modules/control-plane/shared/api/__generated__/data-contracts';
import { DatasetDiff } from '@/modules/control-plane/shared/types';

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
