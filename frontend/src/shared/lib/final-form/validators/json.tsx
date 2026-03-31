import { required as checkEmptyValue } from './required';

export const json = (value: any) => {
  if (checkEmptyValue(value)) return false;

  try {
    JSON.parse(value);
    return false;
  } catch {
    return 'Invalid JSON';
  }
};
