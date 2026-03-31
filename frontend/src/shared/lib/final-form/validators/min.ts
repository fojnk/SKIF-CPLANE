import { required as checkEmptyValue } from './required';

export const min = (value: any, min: number) => {
  if (checkEmptyValue(value)) return false;
  return +value < min && `Value must not be less than ${min}`;
};
