import { InputControlSize, Select, SelectOption } from '@gravity-ui/uikit';
import { FieldValidator } from 'final-form';
import { Field } from 'react-final-form';

import { FormFieldRow } from './form-field-row';

export interface Props {
  fieldName: string;
  className?: string;
  size?: InputControlSize;
  options?: SelectOption[];
  label?: string;
  required?: boolean;
  validate?: FieldValidator<any>;
}

export const FormFieldSelector = ({
  validate,
  required,
  label,
  fieldName,
  className,
  size = 'l',
  options,
}: Props) => {
  return (
    <Field name={fieldName} validate={validate}>
      {({ input }) => (
        <FormFieldRow label={label} className={className} required={required}>
          <Select
            options={options}
            multiple={false}
            size={size}
            value={[input.value]}
            onUpdate={(raw) => {
              input.onChange({
                target: {
                  value: raw[0],
                },
              });
            }}
          />
        </FormFieldRow>
      )}
    </Field>
  );
};
