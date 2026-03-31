import {
  SegmentedRadioGroup,
  SegmentedRadioGroupProps,
} from '@gravity-ui/uikit';
import cx from 'clsx';

import type { ConfigRendererComponentProps } from '.';

export const RadioButtonConfigRenderer = ({
  componentProps = {},
  fieldProps,
}: ConfigRendererComponentProps<
  Omit<SegmentedRadioGroupProps, 'onChange' | 'onUpdate' | 'value' | 'name'>
>) => {
  return (
    <SegmentedRadioGroup
      {...componentProps}
      size={componentProps.size ?? 'l'}
      className={cx('cfs__element cfs__radio-button', componentProps.className)}
      value={fieldProps.input.value}
      onUpdate={(value) => fieldProps.input.onChange({ target: { value } })}
    />
  );
};
