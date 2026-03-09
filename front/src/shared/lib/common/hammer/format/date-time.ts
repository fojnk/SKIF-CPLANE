import moment, { Moment } from 'moment/moment';

import { ms } from '@/shared/lib/common/ms';
import { typeGuard } from '@/shared/lib/common/type-guard';

import { NO_VALUE } from './constants';
import { parseSetting } from './utils';

import 'moment/locale/ru.js';

moment.locale('ru');

const toMoment = function (value: Maybe<string | number | Moment>) {
  if (typeGuard.isNumber(value)) {
    // Assume unix timestamp
    return moment.unix(value);
  } else if (typeGuard.isString(value)) {
    return moment(value);
  } else if (moment.isMoment(value)) {
    return value;
  }
};

const formatMs = (valueInMs: number) => {
  if (valueInMs < ms.second) {
    return `${valueInMs} мс.`;
  }

  if (valueInMs < ms.minute) {
    return `${Math.floor(valueInMs / ms.second)} сек.`;
  }

  if (valueInMs < ms.hour) {
    const minutes = valueInMs / ms.minute;
    const seconds = valueInMs % ms.minute;

    return `${Math.floor(minutes)} мин.${seconds ? ` ${Math.floor(seconds)} сек.` : ''}`;
  }

  const hours = valueInMs / ms.hour;
  const minutes = valueInMs % ms.hour;

  return `${Math.floor(hours)} час.${minutes ? ` ${Math.floor(minutes)} мин.` : ''}`;
};

export const dateTime = function (
  value: Maybe<string | number | Moment>,
  settings?: Maybe<{
    format?:
      | 'human'
      | 'full'
      | 'short'
      | 'day'
      | 'month'
      | 'human-time'
      | 'full-no-sec'
      | 'time';
    pattern?: string;
  }>,
) {
  const dateFormat = parseSetting(settings, 'format', 'full');
  const datePattern = parseSetting(settings, 'pattern');

  const instance = toMoment(value)!;

  if (typeGuard.isUndefined(value)) {
    return NO_VALUE;
  }

  if (datePattern) {
    return instance.format(datePattern);
  }

  switch (dateFormat) {
    case 'human':
      return instance.fromNow();
    case 'human-time':
      return formatMs(
        moment
          .duration(typeof value === 'object' ? value!.get('ms') : value!, 'ms')
          .get('ms'),
      );
    case 'full':
      return instance.format('DD MMM YYYY HH:mm:ss');
    case 'full-no-sec':
      return instance.format('DD MMM YYYY HH:mm');

    case 'short':
      return instance.format('DD MMM HH:mm');
    case 'day':
      return instance.format('DD MMM YYYY');
    case 'month':
      return instance.format('MMMM YYYY');
    case 'time':
      return instance.format('HH:mm:ss');
    default:
      throw new Error(
        'hammer.format.DateTime: Unknown `format` option. Please specify one of [human, full, short, day, month] or use `pattern` option.',
      );
  }
};
