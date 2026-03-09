export const uppercase = <V extends Maybe<string>>(value: V) =>
  (value && value.toUpperCase()) as V;
