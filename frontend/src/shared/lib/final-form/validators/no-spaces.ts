import { required as checkEmptyValue } from './required';

export const noSpaces = (value: any) => {
  if (checkEmptyValue(value)) return false;
  return /\s/.test(`${value}`) && 'Spaces are not allowed';
};
