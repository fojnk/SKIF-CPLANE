import {
  Label as LabelUI,
  LabelProps as LabelUIProps,
} from '@gravity-ui/uikit';
import cx from 'clsx';

import css from './label.module.scss';

export interface LabelProps extends Omit<LabelUIProps, 'size'> {
  ellipsis?: boolean;
  wordBreak?: boolean;
  size?: LabelUIProps['size'] | 'l';
  copyIconOnly?: boolean;
  hideSeparator?: boolean;
}

export const Label = ({
  ellipsis,
  className,
  wordBreak,
  size,
  copyIconOnly,
  hideSeparator,
  ...props
}: LabelProps) => (
  <LabelUI
    {...props}
    size={size === 'l' ? 'm' : size}
    className={cx(
      css.label,
      {
        [css.hideSeparator]: hideSeparator,
        [css.copyIconOnly]: copyIconOnly,
        [css.ellipsis]: ellipsis,
        [css.wordBreak]: wordBreak,
        [css.sizeL]: size === 'l',
      },
      className,
    )}
  >
    {copyIconOnly ? <>&nbsp;</> : props.children}
  </LabelUI>
);
