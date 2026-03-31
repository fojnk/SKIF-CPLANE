export const maxStrLength = (value: any, strLength: number) => {
  if (value && value.length > strLength) {
    return 'Максимальная длина строки ' + strLength;
  }

  return null;
};
