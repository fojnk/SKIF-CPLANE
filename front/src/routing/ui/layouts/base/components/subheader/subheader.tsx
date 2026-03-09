import cx from 'clsx';

import { BaseLayout } from '@/routing';

import { BaseLayoutHeaderProps } from '../header';

import css from './subheader.module.scss';

export const Subheader = ({ className, ...props }: BaseLayoutHeaderProps) => {
  return (
    <BaseLayout.Header {...props} className={cx(css.subheader, className)} />
  );
};
