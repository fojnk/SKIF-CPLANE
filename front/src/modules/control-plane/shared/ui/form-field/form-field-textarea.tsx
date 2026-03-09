import { InputControlSize, TextArea } from '@gravity-ui/uikit';
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
  className?: string;
  size?: InputControlSize;
  minRows?: number;
  maxRows?: number;
}

export const FormFieldTextarea = ({
  label,
  validate,
  required,
  fieldName,
  hasClear,
  className,
  size = 'l',
  minRows = 2,
  maxRows = 10,
}: Props) => {
  return (
    <Field name={fieldName} validate={validate}>
      {({ input, meta }) => (
        <FormFieldRow label={label} className={className} required={required}>
          <TextArea
            size={size}
            error={meta.touched && meta.error}
            value={input.value}
            minRows={minRows}
            maxRows={maxRows}
            onChange={(e) => {
              input.onChange(e.target.value);
            }}
            hasClear={hasClear}
            errorPlacement="inside"
          />
        </FormFieldRow>
      )}
    </Field>
  );
};
