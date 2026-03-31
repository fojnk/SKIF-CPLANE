import { Text, TextProps } from '@gravity-ui/uikit';
import cx from 'clsx';
import { ReactNode } from 'react';

interface FieldSectionHeaderProps extends TextProps {
  children?: ReactNode;
}

export const FieldSectionHeader = ({
  color = 'secondary',
  variant = 'subheader-1',
  className,
  children,
  ...props
}: FieldSectionHeaderProps) => (
  <Text
    {...props}
    variant={variant}
    color={color}
    className={cx('cfs__header', className)}
  >
    {children}
  </Text>
);
