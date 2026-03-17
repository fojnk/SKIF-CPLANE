import { NO_VALUE } from './constants';
import { parseSetting } from './utils';

export const valueOrDefault = function <V>(
  value: V | undefined,
  settings?: Maybe<AnyObject>,
): V | string {
  if (typeof value !== 'undefined') {
    return value;
  } else {
    return parseSetting(settings, 'defaultValue', NO_VALUE);
  }
};
