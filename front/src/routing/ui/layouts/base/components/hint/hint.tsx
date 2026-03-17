import { CircleInfo } from '@gravity-ui/icons';
import { Text } from '@gravity-ui/uikit';
import cx from 'clsx';
import { ReactNode } from 'react';
import './hint.scss';

export interface PageHintProps {
  children?: ReactNode;
  className?: string;
}

export const Hint = ({ children, className }: PageHintProps) => {
  return (
    <div className={cx('page-hint', className)}>
      <CircleInfo />
      <Text variant="header-1" color="hint">
        {children}
      </Text>
    </div>
  );
};
