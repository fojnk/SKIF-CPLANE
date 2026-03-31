import { Checkbox, CheckboxProps } from '@gravity-ui/uikit';
import cx from 'clsx';

import type { ConfigRendererComponentProps } from '.';

export const CheckboxConfigRenderer = ({
  componentProps = {},
  fieldProps,
}: ConfigRendererComponentProps<
  Omit<
    CheckboxProps,
    'onChange' | 'onUpdate' | 'value' | 'name' | 'checked' | 'size'
  >
>) => {
  return (
    <Checkbox
      {...componentProps}
      checked={!!fieldProps.input.checked}
      size="l"
      className={cx('cfs__element cfs__checkbox', componentProps.className)}
      onUpdate={(value) => fieldProps.input.onChange({ target: { value } })}
    />
  );
};
