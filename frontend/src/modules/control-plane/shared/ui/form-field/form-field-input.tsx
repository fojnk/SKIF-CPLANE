import { InputControlSize, TextInput } from '@gravity-ui/uikit';
import { FieldValidator } from 'final-form';
import React from 'react';
import { Field } from 'react-final-form';

import { FormFieldRow } from '@/modules/control-plane/shared/ui/form-field/form-field-row';

interface Props {
  label?: string;
  validate?: FieldValidator<any>;
  required?: boolean;
  fieldName: string;
  hasClear?: boolean;
  autoFocus?: boolean;
  className?: string;
  size?: InputControlSize;
  placeholder?: string;
}

export const FormFieldInput = ({
  label,
  validate,
  required,
  fieldName,
  hasClear,
  autoFocus = false,
  className,
  size = 'l',
  placeholder,
}: Props) => {
  return (
    <Field name={fieldName} validate={validate}>
      {({ input, meta }) => (
        <FormFieldRow label={label} className={className} required={required}>
          <TextInput
            autoFocus={autoFocus}
            size={size}
            error={meta.touched && meta.error}
            value={input.value}
            onChange={(e) => {
              input.onChange(e.target.value);
            }}
            hasClear={hasClear}
            errorPlacement="inside"
            placeholder={placeholder}
          />
        </FormFieldRow>
      )}
    </Field>
  );
};
