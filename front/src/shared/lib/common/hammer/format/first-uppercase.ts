export const firstUppercase = <V extends Maybe<string>>(value: V): V =>
  (value && value.charAt(0).toUpperCase() + value.slice(1)) as V;
