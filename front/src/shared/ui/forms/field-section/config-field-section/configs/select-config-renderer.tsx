import { Select, SelectProps } from '@gravity-ui/uikit';
import cx from 'clsx';

import type { ConfigRendererComponentProps } from '.';

export const SelectConfigRenderer = ({
  componentProps = {},
  fieldProps,
}: ConfigRendererComponentProps<
  Omit<
    SelectProps,
    'onChange' | 'onUpdate' | 'value' | 'errorPlacement' | 'name'
  > & { forceShowError?: boolean }
>) => {
  return (
    <Select
      {...componentProps}
      size={componentProps.size ?? 'l'}
      placeholder={componentProps.placeholder ?? 'Выберите значение...'}
      className={cx('cfs__element cfs__select', componentProps.className)}
      value={fieldProps.input.value == null ? [] : [fieldProps.input.value]}
      errorPlacement="inside"
      width="max"
      onUpdate={(values) => {
        fieldProps.input.onChange({ target: { value: values[0] } });
      }}
      error={
        componentProps.errorMessage ||
        (componentProps.forceShowError && fieldProps.meta.error) ||
        (fieldProps.meta.touched && fieldProps.meta.error)
      }
      errorMessage={
        componentProps.errorMessage ||
        (componentProps.forceShowError && fieldProps.meta.error) ||
        (fieldProps.meta.touched && fieldProps.meta.error)
      }
    />
  );
};
