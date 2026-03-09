import { Flex } from '@gravity-ui/uikit';
import React from 'react';

import { GlobalLoader } from '@/shared/ui/loaders';

export const BlockLoader: React.FC = () => {
  return (
    <Flex style={{ position: 'relative', height: '100%' }}>
      <GlobalLoader absolute size="m" fadingOut />
    </Flex>
  );
};
