import cx from 'clsx';
import { ReactNode } from 'react';

import { createValueModel } from '@/shared/lib/effector/value-model';
import { GlobalLoader } from '@/shared/ui/loaders';

import {
  ContentAside,
  ContentAsideProps as ContentAsideOriginalProps,
} from './content-aside';

import './content.scss';

export type ContentAsideProps = Omit<ContentAsideOriginalProps, 'loading'>;

export const contentElement = createValueModel<HTMLDivElement | null>(null);

export const Content = ({
  children,
  className,
  aside,
  loading,
  hideContentInLoading = true,
  hideAsideInLoading = true,
}: {
  children?: ReactNode;
  className?: string;
  aside?: Maybe<ContentAsideProps>;
  loading?: boolean;
  hideAsideInLoading?: boolean;
  hideContentInLoading?: boolean;
}) => {
  const loadingNode = loading && hideContentInLoading && (
    <GlobalLoader absolute fadingOut withBackground higherOrder />
  );

  return (
    <div
      className={cx('page-content', { 'with-aside': !!aside }, className)}
      ref={contentElement.set}
    >
      {aside ? (
        <>
          <ContentAside {...aside} loading={hideAsideInLoading && loading} />
          <div className="page-content__inner-content">
            {children}
            {loadingNode}
          </div>
        </>
      ) : (
        <>
          {children}
          {loadingNode}
        </>
      )}
    </div>
  );
};
