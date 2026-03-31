import { FieldValidator } from 'final-form';

import { DATA_SOURCE_TYPE_OPTIONS } from '@/modules/control-plane/shared/constants';
import { FormFieldSelector } from '@/modules/control-plane/shared/ui/form-field';

interface Props {
  fieldName: string;
  className?: string;
  label?: string;
  required?: boolean;
  validate?: FieldValidator<any>;
}

export const DsTypeSelector = ({
  fieldName,
  className,
  label,
  required,
  validate,
}: Props) => {
  return (
    <FormFieldSelector
      required={required}
      label={label}
      fieldName={fieldName}
      options={DATA_SOURCE_TYPE_OPTIONS}
      className={className}
      validate={validate}
    />
  );
};
