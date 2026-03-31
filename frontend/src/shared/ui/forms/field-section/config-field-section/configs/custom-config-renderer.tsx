import { ReactNode } from 'react';
import { FieldRenderProps } from 'react-final-form';

import type { ConfigRendererComponentProps } from '.';

export const CustomConfigRenderer = ({
  componentProps = {},
  fieldProps,
}: ConfigRendererComponentProps<{
  render?: (
    fieldProps: FieldRenderProps<any>,
    extras: { error: any },
  ) => ReactNode;
}>) => {
  return componentProps.render?.(fieldProps, {
    error: fieldProps.meta.touched && fieldProps.meta.error,
  });
};
