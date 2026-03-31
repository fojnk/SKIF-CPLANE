import { required as checkEmptyValue } from './required';

export const noOnlyNumbers = (value: any) => {
  if (checkEmptyValue(value)) return false;
  return (
    !/^(?=.*\D).+$/.test(`${value}`) && 'Field must not contain only numbers'
  );
};
