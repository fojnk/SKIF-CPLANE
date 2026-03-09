import qs from 'qs';

export const createQueryParamsString = (query: AnyObject) => {
  return qs.stringify(query);
};
