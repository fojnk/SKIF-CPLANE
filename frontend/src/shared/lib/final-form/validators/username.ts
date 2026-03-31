import { required as checkEmptyValue } from './required';

export const username = (value: any) => {
  if (checkEmptyValue(value)) return false;
  return (
    !/[a-z]([-a-z0-9]*[a-z0-9])?/.test(`${value}`) &&
    'Value can only contain lowercase letters and numbers'
  );
};
