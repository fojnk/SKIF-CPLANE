/**
 * Show readable values. Value is expected to have format 'foo_bar' and turns into 'Foo bar' or 'Foo Bar'
 * @param {String} value
 * @param {Object} settings
 * @param {String} settings.delimiter - any string, by default '_'
 * @param {String} settings.caps - 'all', 'none', by default 'first'
 * @returns {String}
 */
import { map } from 'lodash-es';

import { firstUppercase } from './first-uppercase';
import { parseSetting } from './utils';

export const readable = (value: string, settings?: Maybe<AnyObject>) => {
  settings = settings || {};

  const delimiter = parseSetting(settings, 'delimiter', '_');
  const caps = parseSetting(settings, 'caps', 'first');
  let formatted: string | string[] = value;

  if (formatted) {
    formatted = formatted.split(delimiter);

    if (caps === 'all') {
      formatted = map(formatted, firstUppercase);
    } else if (caps === 'first') {
      formatted[0] = firstUppercase(formatted[0]);
    }

    formatted = formatted.join(' ');
  }

  return formatted;
};
