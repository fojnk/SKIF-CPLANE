import moment, { Duration } from 'moment';

import { typeGuard } from '@/shared/lib/common/type-guard';

import { NO_VALUE } from './constants';
import { strPad } from './str-pad';
import { parseSetting } from './utils';

/**
 * Show a readable time duration string
 * @param {Number} value - number of milliseconds
 * @param {Object} settings
 * @param {String} settings.format - 'milliseconds' or omitted
 */
export const timeDuration = function (
  value: Maybe<number>,
  settings?: Maybe<{ format?: 'milliseconds' }>,
) {
  const TIME_MEASURES = [
    'years',
    'months',
    'days',
    'hours',
    'minutes',
    'seconds',
    'milliseconds',
  ] as const;
  const OUTPUT_FORMATTER = {
    years: 'y ',
    months: 'm ',
    days: 'd ',
    hours: ':',
    minutes: ':',
    seconds: '',
    milliseconds: '.',
  };
  let durationOutput: string;
  let durationHash: Duration;

  const showMilliseconds = parseSetting(settings, 'format') === 'milliseconds';

  if (typeGuard.isNumber(value)) {
    durationOutput = '';
    durationHash = moment.duration(value);

    TIME_MEASURES.forEach(function (measure) {
      const measureValue = durationHash[measure]();

      if (measure === 'years' || measure === 'months' || measure === 'days') {
        if (measureValue > 0) {
          durationOutput += measureValue + OUTPUT_FORMATTER[measure];
        }
      } else if (
        measure === 'hours' ||
        measure === 'minutes' ||
        measure === 'seconds'
      ) {
        durationOutput += strPad(measureValue, '0') + OUTPUT_FORMATTER[measure];
      } else if (measure === 'milliseconds' && showMilliseconds) {
        durationOutput +=
          OUTPUT_FORMATTER[measure] + strPad(measureValue, '0', 3);
      }
    });

    return durationOutput;
  } else {
    return NO_VALUE;
  }
};
