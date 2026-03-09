import { Flex } from '@gravity-ui/uikit';
import cx from 'clsx';
import React, { ReactNode } from 'react';

import css from './item.module.scss';

interface Props {
  className?: string;
  children?: ReactNode;
}

export const ItemContent = ({ children, className }: Props) => {
  return (
    <Flex direction="column" className={cx(css.itemContent, className)}>
      {children}
    </Flex>
  );
};
