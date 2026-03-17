import { required as checkEmptyValue } from './required';

export const max = (value: any, max: number) => {
  if (checkEmptyValue(value)) return false;
  return +value > max && `Value must not be greater than ${max}`;
};
