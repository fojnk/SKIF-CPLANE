import { typeGuard } from '@/shared/lib/common/type-guard';

import { required as checkEmptyValue } from './required';

export const numeric = (value: any) => {
  if (checkEmptyValue(value)) return false;
  return !typeGuard.isNumber(+value) && 'Value must be a number';
};
