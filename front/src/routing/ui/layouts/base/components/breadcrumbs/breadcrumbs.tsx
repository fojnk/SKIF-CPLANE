import { CSSProperties, ReactNode } from 'react';

import { createValueModel } from '@/shared/lib/effector/value-model';

import './index.scss';

export const breadcrumbsElement = createValueModel<HTMLDivElement | null>(null);

export const Breadcrumbs = ({
  children,
  style,
}: {
  children?: ReactNode;
  style?: CSSProperties;
}) => {
  return (
    <div
      ref={breadcrumbsElement.set}
      className="page-header__breadcrumbs"
      style={style}
    >
      {children}
    </div>
  );
};
