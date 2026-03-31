import { required as checkEmptyValue } from './required';

export const uniq = (value: any, usedList: string[]) => {
  if (checkEmptyValue(value)) {
    return false;
  }

  return usedList?.includes(value) && 'This value already exists';
};
