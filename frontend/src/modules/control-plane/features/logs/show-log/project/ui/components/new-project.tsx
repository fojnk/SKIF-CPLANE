import { Flex, Text } from '@gravity-ui/uikit';
import React from 'react';

import { SingleLineItem } from '@/modules/control-plane/features/logs/show-log/components';
import { UpdateLogProjectDC } from '@/modules/control-plane/shared/api/__generated__/data-contracts';

interface Props {
  details: UpdateLogProjectDC;
}

export const NewProject: React.FC<Props> = ({ details }) => {
  return (
    <Flex direction="column" gap={1}>
      {details.name && <SingleLineItem value={details.name} title="Название" />}

      {details.description && (
        <Flex direction="column" gap={1}>
          <Text variant="body-1">
            <b>Описание:</b>
          </Text>
          <Text
            variant="body-1"
            style={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              overflowWrap: 'anywhere',
            }}
          >
            {details.description}
          </Text>
        </Flex>
      )}
    </Flex>
  );
};
