import { Flex, Text } from '@gravity-ui/uikit';
import cx from 'clsx';
import React, { ReactNode } from 'react';

import css from './data-item.module.scss';

interface DataItemProps {
  id?: number;
  title: string;
  selected?: boolean;
  disabled?: boolean;
  classNames?: string;
  onClick?: (id: number) => void;
  actions?: ReactNode;
  showOnlySelected?: boolean;
  variant?: 'soft' | 'normal' | 'outlined';
  showActions?: boolean;
  status?: ReactNode;
}
export const DataItem = ({
  id,
  title,
  classNames,
  selected,
  onClick,
  disabled,
  actions,
  showActions = false,
  variant = 'normal',
  status,
}: DataItemProps) => {
  return (
    <Flex
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      gap="1"
      className={cx(
        css.sfList,
        selected && css.selected,
        disabled && css.disabled,
        variant === 'soft' && css.soft,
        variant === 'outlined' && css.outlined,
        classNames,
      )}
      onClick={() => onClick && id && onClick(id)}
    >
      <Text
        ellipsis
        ellipsisLines={1}
        wordBreak="break-all"
        className={css.sfListTitle}
      >
        {title}
      </Text>
      {actions && selected && !showActions ? actions : null}
      {showActions && actions}
      {status}
    </Flex>
  );
};
