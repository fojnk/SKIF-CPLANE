import { Skeleton } from '@gravity-ui/uikit';
import {
  Link as RouterLink,
  LinkProps as RouterLinkProps,
} from 'atomic-router-react';
import cx from 'clsx';
import { useUnit } from 'effector-react';

import css from './link.module.scss';

export type LinkProps<Params extends AnyObject> = RouterLinkProps<Params> & {
  disabled?: boolean;
  loading?: boolean;
};

export function Link<Params extends AnyObject>({
  disabled,
  className,
  loading,
  children,
  ...props
}: LinkProps<Params>) {
  const routeActive =
    // eslint-disable-next-line react-hooks/rules-of-hooks
    typeof props.to == 'string' ? false : useUnit(props.to.$isOpened);

  const interactive = !disabled && !routeActive && !loading;

  return (
    <RouterLink
      {...props}
      className={cx(
        css.routeLink,
        {
          [css.interactive]: interactive,
        },
        className,
      )}
    >
      {children}
      {loading && <Skeleton />}
    </RouterLink>
  );
}
