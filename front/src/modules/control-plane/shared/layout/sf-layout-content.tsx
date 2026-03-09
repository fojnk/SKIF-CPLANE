import { Flex } from '@gravity-ui/uikit';
import React, { ReactNode } from 'react';

import css from './sf.module.scss';

export const SFLayoutContent = ({ children }: { children?: ReactNode }) => {
  return (
    <Flex className={css.layoutContent} direction="row">
      {children}
    </Flex>
  );
};
