import { CircleCheck, CircleXmark } from '@gravity-ui/icons';
import { Flex, Text } from '@gravity-ui/uikit';
import React from 'react';

import { AclRightDC, EntityType } from '@/modules/stream-flow/shared/types';
import { getUserEntityRights } from '@/modules/stream-flow/shared/utils/aclHelpers';

interface AclMyProps {
  rights: AclRightDC[];
  objectType: EntityType;
}

export const AclMy = ({ rights, objectType }: AclMyProps) => {
  const data = React.useMemo(() => {
    return getUserEntityRights(rights, objectType);
  }, [rights, objectType]);

  const renderRightItem = (
    item: { title: string; has: boolean },
    index: number,
    fixedWidth?: boolean,
  ) => (
    <Flex
      key={index}
      direction="row"
      gap={1}
      alignItems="center"
      style={fixedWidth ? { minWidth: '120px' } : undefined}
    >
      {item.has ? (
        <CircleCheck color="var(--g-color-base-positive-heavy)" />
      ) : (
        <CircleXmark color="var(--g-color-base-danger-heavy)" />
      )}
      <Text variant="subheader-1">{item.title}</Text>
    </Flex>
  );

  if (objectType === 'experiment') {
    // Special layout for experiment rights - 3 rows
    const experimentRights = {
      row1: [
        'EditExperiment',
        'DeleteExperiment',
        'CreateDatasetLink',
        'DeleteDatasetLink',
      ],
      row2: ['StartExperiment', 'StopExperiment', 'ApplyExperiment'],
      row3: ['CreateVariable', 'EditVariable', 'DeleteVariable'],
    };

    return (
      <Flex direction="column" gap={3}>
        {Object.values(experimentRights).map((rowTitles, rowIndex) => (
          <Flex key={rowIndex} direction="row" gap={4} gapRow={3} wrap="wrap">
            {data
              .filter((item) => rowTitles.includes(item.title))
              .map((item, index) => renderRightItem(item, index, true))}
          </Flex>
        ))}
      </Flex>
    );
  }

  // Default layout for other entity types
  return (
    <Flex direction="row" gap={5} gapRow={2} wrap="wrap">
      {data.map((item, index) => renderRightItem(item, index))}
    </Flex>
  );
};
