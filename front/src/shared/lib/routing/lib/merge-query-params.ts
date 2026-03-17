export const mergeQueryParams = (query1: AnyObject, query2: AnyObject) => {
  const result = { ...query1, ...query2 };

  Object.entries(query2).forEach((entry) => {
    if (entry[1] == null || entry[1] == '') {
      delete result[entry[0]];
    }
  });

  return result;
};
