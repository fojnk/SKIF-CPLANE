import { Flex, Text } from '@gravity-ui/uikit';
import React from 'react';

import {
  DiffRow,
  LogChangesHeader,
} from '@/modules/control-plane/features/logs/show-log/components';
import { UpdateLogProjectDC } from '@/modules/control-plane/shared/api/__generated__/data-contracts';
import { ProjectDiff } from '@/modules/control-plane/shared/types';

interface Props {
  oldData?: UpdateLogProjectDC;
  newData?: UpdateLogProjectDC;
  diff: ProjectDiff;
}

export const UpdateProject: React.FC<Props> = ({ oldData, newData, diff }) => {
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
        {diff.description && (
          <DiffRow
            title="Описание"
            oldValue={
              <Text
                variant="body-1"
                style={{
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  overflowWrap: 'anywhere',
                }}
              >
                {oldData?.description ?? ''}
              </Text>
            }
            newValue={
              <Text
                variant="body-1"
                style={{
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  overflowWrap: 'anywhere',
                }}
              >
                {newData?.description ?? ''}
              </Text>
            }
          />
        )}
      </Flex>
    </Flex>
  );
};
