export const stringifyPretty = (value: AnyObject, space = 2) => {
  try {
    return JSON.stringify(value, undefined, space);
  } catch (_error) {
    return value.toString();
  }
};
