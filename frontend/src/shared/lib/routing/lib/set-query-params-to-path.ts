export const setQueryParamsToPath = (pathname: string, queryString: string) => {
  return pathname + (queryString ? `?${queryString}` : '');
};
