import { TextArea, TextAreaProps } from '@gravity-ui/uikit';
import cx from 'clsx';

import type { ConfigRendererComponentProps } from '.';

export const TextAreaConfigRenderer = ({
  componentProps = {},
  fieldProps,
}: ConfigRendererComponentProps<
  Omit<
    TextAreaProps,
    'onChange' | 'onUpdate' | 'value' | 'errorPlacement' | 'error' | 'name'
  > & { forceShowError?: boolean }
>) => {
  return (
    <TextArea
      {...componentProps}
      {...fieldProps.input}
      size={componentProps.size ?? 'l'}
      errorPlacement="inside"
      autoComplete={componentProps.autoComplete ?? 'off'}
      className={cx('cfs__element cfs__text-area', componentProps.className)}
      error={
        componentProps.errorMessage ||
        (componentProps.forceShowError && fieldProps.meta.error) ||
        (fieldProps.meta.touched && fieldProps.meta.error)
      }
    />
  );
};
