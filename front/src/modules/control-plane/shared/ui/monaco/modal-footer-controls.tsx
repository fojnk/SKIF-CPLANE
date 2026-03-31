import { Flex } from '@gravity-ui/uikit';
import React from 'react';

import { FontSizeSelector } from './font-size-selector';

export const ModalFooterControls = () => {
  return (
    <Flex alignItems="center" gap={3} style={{ flexShrink: 0 }}>
      <FontSizeSelector />
    </Flex>
  );
};
