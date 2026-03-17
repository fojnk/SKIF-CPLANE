import { typeGuard } from '@/shared/lib/common/type-guard';

import { required as checkEmptyValue } from './required';

export const integer = (value: any) => {
  if (checkEmptyValue(value)) return false;

  return !typeGuard.isNumber(+value) ||
    (+value).toString().includes('.') ||
    (+value).toString().includes(',')
    ? 'Value must be an integer'
    : undefined;
};
