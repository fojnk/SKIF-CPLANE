import { required as checkEmptyValue } from './required';

export const porto = (value: any) => {
  if (checkEmptyValue(value)) return false;

  if (!value.startsWith('/')) {
    return 'Value must start with "/" character';
  }

  return false;
};
