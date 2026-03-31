import { Minus } from '@gravity-ui/icons';
import { FooterItem } from '@gravity-ui/navigation';
import { Skeleton } from '@gravity-ui/uikit';
import React from 'react';

import s from './index.module.scss';

const AsideItemsSkeleton = () => {
  return Array(3)
    .fill(null)
    .map((_, i) => (
      <div className={s.skeleton} key={`aside-item-skeleton_${i}`}>
        <FooterItem
          compact={false}
          item={{
            id: `_${i}`,
            icon: Minus,
            title: '',
          }}
        />
        <Skeleton />
      </div>
    ));
};

export default AsideItemsSkeleton;
