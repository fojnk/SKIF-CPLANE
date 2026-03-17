import cx from 'clsx';
import { Field } from 'react-final-form';

import { validators } from '@/shared/lib/final-form';

import {
  SimpleFieldSection,
  SimpleFieldSectionProps,
} from '../simple-field-section';

import { CONFIG_RENDERERS, FieldConfigVariants } from './configs';
import { castValue } from './utils/cast-value';

import './index.scss';

export interface ConfigFieldSectionProps extends SimpleFieldSectionProps {
  config: FieldConfigVariants;
  elementOnly?: boolean;
}

export const ConfigFieldSection = ({
  config,
  elementOnly,
  ...fieldSectionProps
}: ConfigFieldSectionProps) => {
  return (
    <Field
      name={config.field}
      type={config.type === 'checkbox' ? 'checkbox' : undefined}
      initialValue={config.initialValue}
      defaultValue={config.defaultValue}
      allowNull
      parse={(value) => {
        if (Array.isArray(value)) {
          return value.map((item) => castValue(item, config.cast));
        }
        return castValue(value, config.cast);
      }}
      validate={validators.build(config.rules)}
    >
      {(fieldProps) => {
        const Renderer = CONFIG_RENDERERS[config.type];

        const node = (
          <Renderer
            fieldProps={fieldProps}
            // @ts-expect-error TS не может вывезти вариадичность типов из CONFIG_RENDERERS
            componentProps={config.props}
            fieldSectionProps={fieldSectionProps}
          />
        );

        if (elementOnly) {
          return node;
        }

        return (
          <SimpleFieldSection
            {...fieldSectionProps}
            error={config ? undefined : fieldSectionProps.error}
            className={cx(
              `sfs--config-${config.type}`,
              fieldSectionProps.className,
            )}
            showAsterisk={
              fieldSectionProps.showAsterisk ?? config.rules?.required
            }
            outerContent={config.renderOuterContent?.(fieldProps)}
            innerContent={config.renderInnerContent?.(fieldProps)}
          >
            {node}
          </SimpleFieldSection>
        );
      }}
    </Field>
  );
};
