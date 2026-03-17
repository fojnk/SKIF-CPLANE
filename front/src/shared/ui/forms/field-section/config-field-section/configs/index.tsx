import { FieldRenderProps } from 'react-final-form';

import { loadable } from '@/shared/lib/react/loadable';
import { FieldConfig } from '@/shared/ui/forms/field-section/types';

import { SimpleFieldSectionProps } from '../../simple-field-section';

import { CustomConfigRenderer } from './custom-config-renderer';

export const CONFIG_RENDERERS = {
  custom: CustomConfigRenderer,
  'text-input': loadable(
    async () =>
      (await import('./text-input-config-renderer')).TextInputConfigRenderer,
  ),
  select: loadable(
    async () => (await import('./select-config-renderer')).SelectConfigRenderer,
  ),
  'radio-button': loadable(
    async () =>
      (await import('./radio-button-config-renderer'))
        .RadioButtonConfigRenderer,
  ),
  'text-area': loadable(
    async () =>
      (await import('./text-area-config-renderer')).TextAreaConfigRenderer,
  ),
  checkbox: loadable(
    async () =>
      (await import('./checkbox-config-renderer')).CheckboxConfigRenderer,
  ),
} as const;

export type FieldConfigVariants = ValueOf<{
  [K in keyof typeof CONFIG_RENDERERS]: FieldConfig<
    K,
    Parameters<(typeof CONFIG_RENDERERS)[K]>[0]['componentProps']
  >;
}>;

export interface ConfigRendererComponentProps<
  ComponentProps extends AnyObject,
> {
  fieldSectionProps: Omit<SimpleFieldSectionProps, 'outerContent'>;
  componentProps: ComponentProps;
  fieldProps: FieldRenderProps<any>;
}
