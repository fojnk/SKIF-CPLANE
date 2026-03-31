import { Text, TextInput, TextInputProps } from '@gravity-ui/uikit';
import cx from 'clsx';

import type { ConfigRendererComponentProps } from '.';

export const TextInputConfigRenderer = ({
  componentProps = {},
  fieldProps,
}: ConfigRendererComponentProps<
  Omit<
    TextInputProps,
    'onChange' | 'onUpdate' | 'value' | 'errorPlacement' | 'error' | 'name'
  > & {
    unit?: string;
    forceShowError?: boolean;
  }
>) => {
  return (
    <TextInput
      {...componentProps}
      {...fieldProps.input}
      onBlur={(e) => {
        componentProps?.onBlur?.(e);
        fieldProps.input.onBlur(e);
      }}
      onFocus={(e) => {
        componentProps?.onFocus?.(e);
        fieldProps.input.onFocus(e);
      }}
      value={fieldProps.input.value ?? ''}
      size={componentProps.size ?? 'l'}
      type={(fieldProps.input.type as any) || componentProps.type}
      errorPlacement="inside"
      className={cx('cfs__element cfs__text-input', componentProps.className)}
      autoComplete={componentProps.autoComplete ?? 'off'}
      endContent={
        componentProps.endContent != null || componentProps.unit != null ? (
          <>
            {componentProps.unit != null && (
              <Text color="secondary" variant="caption-2">
                {componentProps.unit}
              </Text>
            )}
            {componentProps.endContent}
          </>
        ) : undefined
      }
      error={
        componentProps.errorMessage ||
        (componentProps.forceShowError && fieldProps.meta.error) ||
        (fieldProps.meta.touched && fieldProps.meta.error)
      }
    />
  );
};
