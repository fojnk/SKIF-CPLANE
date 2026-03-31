import cx from 'clsx';
import { ReactNode } from 'react';

interface FieldSectionWrapperProps {
  children?: ReactNode;
  className?: string;
  size?: 's' | 'm';
}

export const FieldSectionWrapper = ({
  children,
  className,
  size = 'm',
}: FieldSectionWrapperProps) => {
  return (
    <div className={cx(`fs__wrapper size-${size}`, className)}>{children}</div>
  );
};
