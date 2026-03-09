import { Flex, Label, Text } from '@gravity-ui/uikit';
import React from 'react';

interface Props {
  name: string;
  description?: string;
  label?: string;
  afterLabel?: React.ReactNode;
  theme?: 'positive' | 'danger';
}

export const LogEntity: React.FC<Props> = ({
  name,
  label,
  description,
  afterLabel,
  theme = 'positive',
}) => {
  return (
    <Flex direction="column" gap={1}>
      <Flex direction="row" gap={2} alignItems="center" wrap>
        <Text variant="body-2" color={theme} ellipsis>
          <b>{name}</b>
        </Text>
        {label && (
          <Label size="xs" theme="clear">
            {label}
          </Label>
        )}
        {afterLabel}
      </Flex>
      {description && description !== '' && (
        <Flex direction="column" gap={1}>
          <Text variant="body-1">
            <b>Description:</b>
          </Text>
          <Text
            variant="body-1"
            style={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              overflowWrap: 'anywhere',
            }}
          >
            {description}
          </Text>
        </Flex>
      )}
    </Flex>
  );
};
