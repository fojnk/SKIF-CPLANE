import { Flex } from '@gravity-ui/uikit';
import React, { ReactNode } from 'react';

export const SfEntityHeader = ({ children }: { children?: ReactNode }) => {
  return (
    <Flex
      className="sf-l-pt sf-l-pr sf-l-pl"
      direction="column"
      gapRow={3}
      style={{ width: '100%', paddingBottom: 12 }}
    >
      {children}
    </Flex>
  );
};
