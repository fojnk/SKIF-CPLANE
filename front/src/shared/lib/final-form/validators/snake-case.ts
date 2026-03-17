import { required as checkEmptyValue } from './required';

export const snakeCase = (value: any) => {
  if (checkEmptyValue(value)) return false;
  return (
    /^(?![a-z]+(_[a-z]+)*$).*/.test(`${value}`) &&
    'Only snake_case format is allowed'
  );
};
