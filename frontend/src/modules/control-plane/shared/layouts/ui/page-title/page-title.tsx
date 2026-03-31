import { Text } from '@gravity-ui/uikit';
import React, { ReactNode } from 'react';

interface Props {
  className?: string;
  children?: ReactNode;
}

export const PageTitle = ({ children, className }: Props) => {
  return (
    <Text
      variant="header-1"
      ellipsis
      className={className}
      style={{ flexShrink: 0 }}
    >
      {children}
    </Text>
  );
};
