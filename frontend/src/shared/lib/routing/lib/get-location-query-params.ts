import qs from 'qs';

export const getLocationQueryParams = (
  search: string = location.search,
): AnyObject => {
  return qs.parse(search.replace('?', ''));
};
