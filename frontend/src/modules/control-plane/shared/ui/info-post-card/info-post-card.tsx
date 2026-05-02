import { Flex } from '@gravity-ui/uikit';
import type { CSSProperties, ReactNode } from 'react';

const shellStyle: CSSProperties = {
  border: '1px solid var(--g-color-line-generic)',
  borderRadius: 16,
  padding: 24,
  background: 'var(--g-color-base-float)',
  boxShadow: '0 2px 12px 0 var(--g-color-sfx-shadow)',
};

type InfoPostCardProps = {
  children: ReactNode;
  style?: CSSProperties;
};

/** Единая оболочка для информационных блоков: обновления, о платформе, обучение. */
export const InfoPostCard = ({ children, style }: InfoPostCardProps) => {
  return (
    <Flex direction="column" gap={3} style={{ ...shellStyle, ...style }}>
      {children}
    </Flex>
  );
};
