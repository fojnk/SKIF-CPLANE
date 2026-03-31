import { typeGuard } from '@/shared/lib/common/type-guard';

import { required as checkEmptyValue } from './required';

export const minLength = (value: any, minLength: number) => {
  if (checkEmptyValue(value)) return false;
  if (!typeGuard.isArray(value) || value.length < minLength) {
    return `Must specify at least ${minLength} ${minLength === 1 ? 'value' : 'values'}`;
  }

  return null;
};
