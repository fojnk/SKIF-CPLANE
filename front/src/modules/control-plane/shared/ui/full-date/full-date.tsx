import { Flex, Text } from '@gravity-ui/uikit';
import React from 'react';

import { hammer } from '@/shared/lib/common/hammer';

interface Props {
  date?: string;
  showSeconds?: boolean;
  size?: 'body-1' | 'body-2';
}

export const FullDate = ({
  date,
  showSeconds = true,
  size = 'body-1',
}: Props) => {
  if (!date) {
    return (
      <Text variant="body-1" color="secondary">
        —
      </Text>
    );
  }

  const timePattern = showSeconds ? 'HH:mm:ss' : 'HH:mm';

  return (
    <Flex direction="row" gap={0} wrap="wrap">
      <Text variant={size} style={{ marginRight: 6 }}>
        {hammer.format.dateTime(date, { pattern: timePattern })}
      </Text>
      <Text variant={size} color="secondary">
        {hammer.format.dateTime(date, { format: 'day' })}
      </Text>
    </Flex>
  );
};
