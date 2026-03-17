import { Text, Flex } from '@gravity-ui/uikit';
import React from 'react';

interface Props {
  title?: string;
  message?: string;
  danger?: boolean;
  button?: React.ReactNode;
}

export const ErrorCard = ({
  title,
  message,
  danger = false,
  button,
}: Props) => {
  return (
    <Flex
      direction="column"
      style={{ height: '100%', padding: 24, width: '100%' }}
      alignItems="center"
      justifyContent="center"
      gapRow={3}
    >
      {title && (
        <Text variant="header-2" color={danger ? 'danger' : 'primary'}>
          {title}
        </Text>
      )}
      {message && (
        <Text
          variant="subheader-2"
          color={danger ? 'danger' : 'primary'}
          style={{ maxWidth: '420px', textAlign: 'center' }}
        >
          {message}
        </Text>
      )}
      {button && <Flex>{button}</Flex>}
    </Flex>
  );
};
