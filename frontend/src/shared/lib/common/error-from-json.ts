export const getErrorFromJSON = (value: string, error: Error): string => {
  const eps = 50;

  let index = 0;
  try {
    index = Number(error.message.split('at position ')[1]);
  } catch (e) {
    console.error(e);
  }

  try {
    return (
      value.slice(index - eps >= 0 ? index - eps : 0, index + eps + 1) ||
      error.message
    );
  } catch (_e) {
    return error.message;
  }
};
