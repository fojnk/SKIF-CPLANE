import cx from 'clsx';
import { FC, ReactNode } from 'react';

import AsideItemsContent, {
  AsideItemsContentProps,
} from './components/Content';
import AsideHeader, { AsideHeaderProps } from './components/Header';
import AsideItemsSkeleton from './components/ItemsSkeleton';

export interface ContentAsideProps
  extends AsideHeaderProps,
    AsideItemsContentProps {
  children?: ReactNode;
  wide?: boolean;
  edit?: boolean;
}

export const ContentAside: FC<ContentAsideProps> = (props) => {
  const {
    title,
    description,
    loading,
    icon,
    items,
    children,
    wide,
    edit,
    extraItems,
  } = props;

  return (
    <div
      className={cx('page-content__aside-wrapper', {
        'is--wide': wide,
        'is--edit': edit,
      })}
    >
      <div className="page-content__aside">
        {title && (
          <AsideHeader
            title={title}
            loading={loading}
            description={description}
            icon={icon}
          />
        )}
        <div className="page-content__aside-items">
          {loading && !items?.length ? (
            <AsideItemsSkeleton />
          ) : (
            <AsideItemsContent
              items={items}
              loading={loading}
              extraItems={extraItems}
            />
          )}
        </div>
        <div
          className={cx('page-content__aside-content', {
            'has--title': title,
          })}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
