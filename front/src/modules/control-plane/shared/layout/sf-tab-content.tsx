import { Flex } from '@gravity-ui/uikit';
import cx from 'clsx';
import React, { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  scrollable?: boolean;
  padding?: boolean;
}

export const SfTabContent = ({
  children,
  scrollable = true,
  padding = true,
}: Props) => {
  return (
    <Flex
      className={cx(
        padding && 'sf-l-pl sf-l-pr',
        scrollable && 'sf-l-scrollable',
      )}
      direction="column"
      style={{ height: '100%', width: '100%', position: 'relative' }}
    >
      <Flex
        shrink={0}
        className={cx(padding && 'sf-l-pt sf-l-pb-lg')}
        direction="column"
        style={{ minHeight: '100%', width: '100%' }}
      >
        {children}
      </Flex>
    </Flex>
  );
};
