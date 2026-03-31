import { Loader, LoaderProps } from '@gravity-ui/uikit';
import cx from 'clsx';
import { CSSProperties } from 'react';

import './global-loader.scss';

interface GlobalLoaderProps {
  className?: string;
  fadingOut?: boolean;
  withBackground?: boolean;
  higherOrder?: boolean;
  absolute?: boolean;
  style?: CSSProperties;
  size?: LoaderProps['size'];
}

export const GlobalLoader = ({
  className,
  fadingOut,
  higherOrder,
  absolute,
  withBackground,
  style,
  size = 'l',
}: GlobalLoaderProps) => {
  return (
    <div
      className={cx(
        'global-loader',
        {
          ['inherit-background']: withBackground,
          ['fading-out']: fadingOut,
          ['higher-order']: higherOrder,
          ['absolute']: absolute,
        },
        className,
      )}
      style={style}
    >
      <Loader size={size} />
    </div>
  );
};
