import { typeGuard } from '@/shared/lib/common/type-guard';

export const castValue = (
  value: any,
  cast?: 'string' | 'number' | 'integer' | 'integerWithNegative',
) => {
  if (cast === 'number') {
    if (value && typeGuard.isNumber(+value)) {
      return +value;
    }
    return null;
  }
  if (cast === 'integer') {
    return +value.replace(/[^0-9]/g, '');
  }
  if (cast === 'integerWithNegative') {
    if (value === '-' || value === '0') return value;
    return isNaN(parseInt(value)) ? null : parseInt(value);
  }
  return value;
};
