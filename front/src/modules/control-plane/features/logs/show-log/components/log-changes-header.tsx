import { Flex, Text } from '@gravity-ui/uikit';
import React from 'react';

export const LogChangesHeader = () => {
  return (
    <Flex direction="row" style={{ width: '100%' }} className="n">
      <Flex
        direction="row"
        style={{ width: '50%' }}
        className="log-pad"
        justifyContent="center"
      >
        <Text variant="code-1" color="danger">
          Old value
        </Text>
      </Flex>
      <Flex
        direction="row"
        style={{ width: '50%' }}
        className="log-pad"
        justifyContent="center"
      >
        <Text variant="code-1" color="positive">
          New value
        </Text>
      </Flex>
    </Flex>
  );
};
