import { Flex } from '@gravity-ui/uikit';
import React, { ReactNode } from 'react';

import { ListPageContainer } from '@/modules/control-plane/shared/layouts/page/list-page-container';
import { BaseLayout } from '@/routing';

import css from './page.module.scss';

interface Props {
  children?: ReactNode;
  footer?: ReactNode;
}

export const ListPage = ({ children, footer }: Props) => {
  return (
    <>
      <Flex direction="column" className={css.listPage}>
        {children}
      </Flex>
      {footer && (
        <BaseLayout.Footer bottomAligned>
          <ListPageContainer>{footer}</ListPageContainer>
        </BaseLayout.Footer>
      )}
    </>
  );
};
