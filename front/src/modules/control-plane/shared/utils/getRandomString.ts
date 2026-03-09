import { nanoid } from 'nanoid';

export const getRandomString = (prefix = '') => {
  return prefix ? `${prefix}_${nanoid()}` : nanoid();
};
