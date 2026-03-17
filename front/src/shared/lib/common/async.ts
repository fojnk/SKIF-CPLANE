export const waitAsync = (ms = 1000) =>
  new Promise((resolve) => setTimeout(resolve, ms));
