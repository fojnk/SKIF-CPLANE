import { required as checkEmptyValue } from './required';

export const url = (value: any) => {
  if (checkEmptyValue(value)) return false;
  return (
    // eslint-disable-next-line max-len
    !/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/.test(
      `${value}`,
    ) && 'Value must be a valid URL'
  );
};
