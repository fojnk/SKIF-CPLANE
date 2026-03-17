import { required as checkEmptyValue } from './required';

export const keyName = (value: any) => {
  if (checkEmptyValue(value)) return false;

  const isValid = /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(`${value}`);
  return (
    !isValid &&
    'Only letters, numbers and underscores are allowed, must start with a letter or underscore'
  );
};
