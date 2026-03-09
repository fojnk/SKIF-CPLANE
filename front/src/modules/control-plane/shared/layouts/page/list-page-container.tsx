import { Flex } from '@gravity-ui/uikit';
import React, { ReactNode } from 'react';

import css from './page.module.scss';

interface Props {
  children?: ReactNode;
}

export const ListPageContainer = ({ children }: Props) => {
  return (
    <>
      <Flex direction="column" className={css.listPageContainer}>
        {children}
      </Flex>
    </>
  );
};
