import { Flex, Text } from '@gravity-ui/uikit';
import React from 'react';

import { SfEntityHeader } from '@/modules/control-plane/shared/layout';
import { NamespaceInfoDC } from '@/modules/control-plane/shared/types';
import { EntityLabels } from '@/modules/control-plane/shared/ui';

import { NamespaceActions } from './namespace-actions';

interface Props {
  namespace: NamespaceInfoDC;
}

export const NamespaceHeader = ({ namespace }: Props) => {
  return (
    <SfEntityHeader>
      <Flex direction="column" gap={3}>
        <Flex direction="row" alignItems="center">
          <Text variant="header-2" ellipsis>
            {namespace.name}
          </Text>
        </Flex>
        <Flex direction="row" gap={2} alignItems="center">
          <NamespaceActions namespace={namespace} />
          <EntityLabels id={namespace.id!} />
        </Flex>
      </Flex>
    </SfEntityHeader>
  );
};
