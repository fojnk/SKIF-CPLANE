import { Flex } from '@gravity-ui/uikit';
import type { CSSProperties, ReactNode } from 'react';

import css from './info-post-card.module.scss';

type InfoPostCardProps = {
  children: ReactNode;
  style?: CSSProperties;
};

/** Единая оболочка для информационных блоков: обновления, о платформе, обучение. */
export const InfoPostCard = ({ children, style }: InfoPostCardProps) => {
  return (
    <Flex direction="column" gap={3} className={css.shell} style={style}>
      {children}
    </Flex>
  );
};
