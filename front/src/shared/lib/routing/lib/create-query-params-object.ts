import qs from 'qs';

export const createQueryParamsObject = (
  query: AnyObject,
  search: string = location.search,
) => {
  const result: Record<string, string> = {};
  const entries = Object.entries(query);

  entries.forEach(([key, value]) => {
    if (value != null && value != '') {
      result[key] = encodeURIComponent(value);
    }
  });

  return qs.parse(search.replace('?', ''));
};
