import { Skeleton, Text } from '@gravity-ui/uikit';
import React, { FC, isValidElement } from 'react';

import s from './index.module.scss';

export type AsideHeaderProps = {
  title?: string;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  loading?: boolean;
};

const AsideHeader: FC<AsideHeaderProps> = (props) => {
  const { loading, title, description, icon } = props;
  return (
    <div className={s.header}>
      <div className={s.title}>
        {loading && <Skeleton />}
        <Text variant="body-3" wordBreak="break-word">
          {title}
        </Text>
        {description &&
          (isValidElement(description) ? (
            description
          ) : (
            <Text variant="caption-2" color="hint">
              {description}
            </Text>
          ))}
      </div>
      {icon && (
        <div className={s.icon}>
          {loading && <Skeleton />}
          <div className={s.iconContainer}>{icon}</div>
        </div>
      )}
    </div>
  );
};

export default AsideHeader;
