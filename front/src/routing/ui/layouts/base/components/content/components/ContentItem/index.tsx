import { FooterItem } from '@gravity-ui/navigation';
import { Skeleton } from '@gravity-ui/uikit';
import cx from 'clsx';
import React, { FC, useState } from 'react';

import AsideItemsContent, { ContentAsideItem } from '../Content';

import s from './index.module.scss';

const ContentAsideItemComponent: FC<{
  item: ContentAsideItem;
  loading?: boolean;
  deep?: number;
}> = (props) => {
  const { item, deep, loading } = props;
  const [isShowChildren, setShowChildren] = useState(true);

  const onItemClickHandler =
    (item: ContentAsideItem) => (_: any, collapsed: any, e: any) => {
      e.preventDefault();
      e.stopPropagation();

      if (item?.items?.length) {
        setShowChildren((prevState) => !prevState);
        return item;
      }
      item.onClick?.(item);
    };

  return (
    <div
      key={item.title}
      style={{
        paddingLeft: `calc(var(--custom-header-min-width) * ${+!!deep} ) `,
      }}
      className={cx('content-item', {
        [s.skeleton]: loading,
        disabled: item.disabled,
      })}
    >
      <FooterItem
        compact={false}
        item={{
          id: `${item.title}`,
          icon: item.icon,
          title: (
            <div className={s.content}>
              {item.title}

              {item?.after && <span className={s.after}>{item.after}</span>}
            </div>
          ),
          current: item.active,
          hidden: item.hidden,
          onItemClick: onItemClickHandler(item),
        }}
      />

      {item?.items?.length && (
        <div className={`${s.children} ${!isShowChildren && s.hidden}`}>
          <AsideItemsContent
            deep={+!!deep + 1}
            items={item.items}
            loading={loading}
          />
        </div>
      )}

      {loading && <Skeleton />}
    </div>
  );
};

export default ContentAsideItemComponent;
