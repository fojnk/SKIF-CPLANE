import { required as checkEmptyValue } from './required';

export const noNumbers = (value: any) => {
  if (checkEmptyValue(value)) return false;
  return /\d/.test(`${value}`) && 'Numbers are not allowed';
};
