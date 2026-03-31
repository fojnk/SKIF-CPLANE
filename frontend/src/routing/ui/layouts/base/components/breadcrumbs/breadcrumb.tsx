import cx from 'clsx';
import { useUnit } from 'effector-react';
import { ComponentType, CSSProperties, isValidElement, ReactNode } from 'react';

import { getLocationQueryParams } from '@/shared/lib/routing';
import { Button } from '@/shared/ui/button';
import { Portal } from '@/shared/ui/portal';

import { breadcrumbsElement } from './breadcrumbs';

interface BreadcrumbProps {
  className?: string;
  portal?: boolean;
  children?: ReactNode;
  icon?: ComponentType;
  action?: (params: { query: AnyObject }) => void;
  style?: CSSProperties;
  /**
   * Убрать стили активного состояния
   */
  removeActiveStyles?: boolean;
}

export const Breadcrumb = ({
  className,
  portal,
  action,
  icon: Icon,
  children,
  style,
  removeActiveStyles,
}: BreadcrumbProps) => {
  const containerElement = useUnit(breadcrumbsElement.$value);

  const node = (
    <div
      className={cx('page-header__breadcrumb', {
        'ignore-current-styles': removeActiveStyles,
      })}
      style={style}
    >
      {isValidElement(children) ? (
        children
      ) : (
        <Button
          view="flat"
          size="s"
          className={className}
          onClick={() => {
            action?.({ query: getLocationQueryParams() });
          }}
        >
          {Icon && (
            <Button.Icon>
              <Icon />
            </Button.Icon>
          )}
          {children}
        </Button>
      )}
    </div>
  );

  if (portal) {
    return <Portal element={containerElement}>{node}</Portal>;
  }

  return node;
};
