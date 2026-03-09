export const isJsonValid = (str: string) => {
  try {
    return JSON.parse(str);
  } catch (_e) {
    return null;
  }
};
