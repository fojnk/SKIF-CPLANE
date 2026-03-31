import { Flex, Text } from '@gravity-ui/uikit';
import React, { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export const SfListMessage = ({ children }: Props) => {
  return (
    <Flex direction="row" justifyContent="center">
      <Text variant="body-1" color="secondary">
        {children}
      </Text>
    </Flex>
  );
};
