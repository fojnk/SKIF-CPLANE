import cx from 'clsx';
import { ReactNode } from 'react';

import { createValueModel } from '@/shared/lib/effector/value-model';

import type { BaseLayoutHeaderAction } from '../header';

import { FooterActions } from './footer-actions';

import './footer.scss';

export interface BaseLayoutFooterProps {
  children?: ReactNode;
  bottomAligned?: boolean;
  className?: string;
  actions?: BaseLayoutHeaderAction[];
}

export const footerElement = createValueModel<HTMLDivElement | null>(null);

export const Footer = ({
  children,
  bottomAligned,
  className,
  actions,
}: BaseLayoutFooterProps) => {
  return (
    <div
      id="base-layout-footer"
      ref={footerElement.set}
      className={cx(
        'page-footer',
        {
          ['bottom-aligned']: bottomAligned,
        },
        className,
      )}
    >
      {children}
      {!!(actions && actions.length) && <FooterActions actions={actions} />}
    </div>
  );
};
