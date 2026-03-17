export const makePathWithParams = (
  urlTemplate: string,
  params: Record<string, any> = {},
  queryParams: Record<string, any> = {},
): string => {
  let url = urlTemplate.replace(/:([a-zA-Z_]+)/g, (match, key) => {
    return key in params ? encodeURIComponent(params[key]) : match;
  });

  const queryString = Object.keys(queryParams)
    .map(
      (key) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(queryParams[key])}`,
    )
    .join('&');

  if (queryString) {
    url += (url.includes('?') ? '&' : '?') + queryString;
  }

  return url;
};
