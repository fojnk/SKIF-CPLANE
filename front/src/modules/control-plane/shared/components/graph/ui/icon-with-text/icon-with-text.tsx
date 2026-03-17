import { TriangleExclamation } from '@gravity-ui/icons';
import { Icon, Text } from '@gravity-ui/uikit';
import React from 'react';

import styles from './icon-with-text.module.scss';

interface IconWithTextProps {
  text: string;
  type: 'danger' | 'warning';
  iconSize?: number;
  textVariant?: 'caption-1' | 'caption-2' | 'body-1' | 'body-2';
}

export const IconWithText: React.FC<IconWithTextProps> = ({
  text,
  type,
  iconSize = 14,
  textVariant = 'caption-2',
}) => {
  const iconClassName =
    type === 'warning' ? styles.iconWarning : styles.iconDanger;

  return (
    <div className={styles.container}>
      <Icon
        data={TriangleExclamation}
        size={iconSize}
        className={iconClassName}
      />
      <Text variant={textVariant} color={type}>
        {text}
      </Text>
    </div>
  );
};
