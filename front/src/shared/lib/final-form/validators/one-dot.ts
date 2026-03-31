import { required as checkEmptyValue } from './required';

export const oneDot = (value: any) => {
  if (checkEmptyValue(value)) return false;
  const regex = /\./g;

  const matches = value.match(regex);

  return matches && matches.length > 1 ? 'Only one dot is allowed' : false;
};
