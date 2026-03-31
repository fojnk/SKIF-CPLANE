import { Skeleton } from '@gravity-ui/uikit';
import React from 'react';

import css from './data-item.module.scss';

export const DataItemSkeleton = () => {
  return (
    <Skeleton
      className={css.sfListSkeleton}
      key="skeleton_1"
      style={{ opacity: 0.6 }}
    />
  );
};
