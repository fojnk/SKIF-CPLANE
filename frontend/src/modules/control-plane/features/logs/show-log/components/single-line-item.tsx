import { Flex, Text } from '@gravity-ui/uikit';
import React from 'react';

interface Props {
  title: string;
  value: string;
  color?: 'positive' | 'danger' | 'primary' | 'utility' | 'warning' | 'info';
}

export const SingleLineItem: React.FC<Props> = ({
  title,
  value,
  color = 'primary',
}) => {
  return (
    <Flex direction="row" gap={2}>
      <Text variant="body-1">
        <b>{title}:</b>
      </Text>
      <Text variant="body-1" color={color}>
        {value}
      </Text>
    </Flex>
  );
};
