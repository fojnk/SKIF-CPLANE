import { Flex, Text } from '@gravity-ui/uikit';
import React from 'react';

import {
  DiffRow,
  LogChangesHeader,
} from '@/modules/stream-flow/features/logs/show-log/components';
import { UpdateLogExperimentDC } from '@/modules/stream-flow/shared/api/__generated__/data-contracts';
import { ExperimentDiff } from '@/modules/stream-flow/shared/types';

interface Props {
  oldData?: UpdateLogExperimentDC;
  newData?: UpdateLogExperimentDC;
  diff: ExperimentDiff;
}

export const UpdateExperiment: React.FC<Props> = ({
  oldData,
  newData,
  diff,
}) => {
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
