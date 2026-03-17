import { parseSetting } from './utils';

export const hex = function (
  value: Maybe<string>,
  settings?: Maybe<AnyObject>,
) {
  const numberValue = Number(value);
  const result = isNaN(numberValue) ? value : numberValue.toString(16);

  if (parseSetting(settings, 'uppercase', false)) {
    return result?.toUpperCase();
  }

  return result;
};
