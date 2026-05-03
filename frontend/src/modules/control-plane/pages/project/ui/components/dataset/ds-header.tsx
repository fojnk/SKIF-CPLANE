import { Database } from '@gravity-ui/icons';
import { Flex, Icon, Label, Text } from '@gravity-ui/uikit';
import React from 'react';

import { SfEntityHeader } from '@/modules/control-plane/shared/layout';
import { DatasetDC, ProjectInfoDC } from '@/modules/control-plane/shared/types';
import {
  DatasetTypeLabel,
  EntityLabels,
} from '@/modules/control-plane/shared/ui';

import { DsActions } from './ds-actions';

interface Props {
  dataset: DatasetDC;
  project: ProjectInfoDC;
}

export const DsHeader = ({ dataset, project }: Props) => {
  return (
    <SfEntityHeader>
      <Flex direction="column" gap={3}>
        <Flex direction="column">
          <Flex direction="row" gap={2} alignItems="center">
            <Icon
              data={Database}
              size={18}
              style={{
                color: 'var(--g-color-text-secondary)',
                marginTop: '3px',
              }}
            />
            <Text variant="header-2" ellipsis>
              {dataset.name}
            </Text>
          </Flex>
        </Flex>
        <Flex direction="row" gap={2} alignItems="center">
          <DsActions dataset={dataset} project={project} />
          <DatasetTypeLabel type={dataset.type} showValue={false} size="s" />
          {dataset.public && (
            <Label size="s" theme="clear">
              Public
            </Label>
          )}
          <EntityLabels id={dataset.id!} />
        </Flex>
      </Flex>
    </SfEntityHeader>
  );
};
