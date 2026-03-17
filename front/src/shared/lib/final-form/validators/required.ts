export const required = (value: any) => {
  if (
    value === '' ||
    value == null ||
    (Array.isArray(value) && !value.length)
  ) {
    return 'This field is required';
  }

  return null;
};
