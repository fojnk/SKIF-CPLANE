import { Flex, Text } from '@gravity-ui/uikit';
import cx from 'clsx';
import React, { ReactNode } from 'react';

import css from './sf.module.scss';

interface Props {
  button?: ReactNode;
  title?: string;
  className?: string;
  onClick?: () => void;
}
export const SFLayoutHeader = ({
  button,
  title,
  className,
  onClick,
}: Props) => {
  return (
    <Flex
      className={cx(css.layoutHeader, className)}
      direction="row"
      justifyContent={button ? 'space-between' : 'flex-start'}
      alignItems="center"
    >
      {title && (
        <Text
          variant="subheader-1"
          ellipsis
          onClick={onClick ? () => onClick() : undefined}
        >
          {title}
        </Text>
      )}
      {button}
    </Flex>
  );
};
