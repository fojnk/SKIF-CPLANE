import { Flex, Text } from '@gravity-ui/uikit';
import React from 'react';

import { getActionColor } from '@/modules/control-plane/shared/utils/getActionColor';

interface Props {
  action: string;
  showDot?: boolean;
}

export const LogAction: React.FC<Props> = ({ action, showDot = false }) => {
  const color = getActionColor(action);

  return (
    <Flex direction="row" alignItems="center" gap={1}>
      {showDot && (
        <Text color={color} variant="body-1" style={{ lineHeight: 1 }}>
          ●
        </Text>
      )}
      <Text variant="body-1">{action}</Text>
    </Flex>
  );
};
