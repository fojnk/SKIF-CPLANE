import { Flex, Text } from '@gravity-ui/uikit';
import React from 'react';

interface Props {
  title?: string;
  oldValue: React.ReactNode;
  newValue: React.ReactNode;
  size?: 'body-1' | 'body-2';
}

export const DiffRow: React.FC<Props> = ({ oldValue, newValue, title }) => {
  return (
    <Flex direction="column" style={{ width: '100%' }}>
      {title && (
        <Flex
          direction="row"
          style={{ width: '100%' }}
          justifyContent="flex-start"
          className="log-pad log-border log-bg"
        >
          <Text variant="body-1">
            <b>{title}</b>
          </Text>
        </Flex>
      )}
      <Flex
        direction="row"
        style={{ width: '100%' }}
        className="log-border no-brd-t"
      >
        <Flex
          direction="row"
          style={{ width: '50%' }}
          className="log-pad log-border-r"
        >
          {oldValue}
        </Flex>
        <Flex direction="row" style={{ width: '50%' }} className="log-pad">
          {newValue}
        </Flex>
      </Flex>
    </Flex>
  );
};
