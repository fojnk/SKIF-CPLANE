import { Flex } from '@gravity-ui/uikit';
import cx from 'clsx';
import React, { ReactNode } from 'react';

import css from './page.module.scss';

interface Props {
  className?: string;
  children?: ReactNode;
}

export const ItemPage = ({ children, className }: Props) => {
  return (
    <Flex direction="column" className={cx(css.itemPage, className)}>
      {children}
    </Flex>
  );
};
