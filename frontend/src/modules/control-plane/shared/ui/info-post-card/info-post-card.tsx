import { Flex } from '@gravity-ui/uikit';
import type { CSSProperties, ReactNode } from 'react';

const shellStyle: CSSProperties = {
  border:
    '1px solid color-mix(in srgb, var(--g-color-line-brand) 38%, var(--g-color-line-generic))',
  borderRadius: 16,
  padding: 24,
  background:
    'linear-gradient(165deg, var(--g-color-base-info-light) 0%, var(--g-color-base-float) 48%, var(--g-color-base-float) 100%)',
  boxShadow: '0 8px 32px -6px var(--g-color-sfx-shadow)',
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
