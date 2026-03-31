import { typeGuard } from '@/shared/lib/common/type-guard';

import { NO_VALUE } from './constants';
import { number } from './number';
import { parseSetting } from './utils';

export const smallNumber = (
  value: Maybe<string | number>,
  settings?: Maybe<{ significantDigits?: number }>,
) => {
  let significantDigits = parseSetting(settings, 'significantDigits', 0);
  const MAX_PRECISION = 20;
  const DECIMAL_DELIMETER = '.';
  const INSIGNIFICANT_DIGIT = 0;

  if (typeGuard.isNumber(value)) {
    if (value === 0) {
      return '0';
    }

    const stringified = value.toFixed(MAX_PRECISION).split(DECIMAL_DELIMETER);
    const integerPart = stringified[0];
    const decimalPart = stringified[1].split('');

    let result = number(Number(integerPart));
    let siginificantDigitEncountered = false;

    for (let i = 0; i < decimalPart.length && significantDigits; i++) {
      const digit = decimalPart[i];

      if (Number(digit) !== INSIGNIFICANT_DIGIT) {
        siginificantDigitEncountered = true;
      }

      if (siginificantDigitEncountered) {
        significantDigits--;
      }

      if (i === 0) {
        result += DECIMAL_DELIMETER;
      }

      result += digit;
    }

    return result;
  } else {
    return NO_VALUE;
  }
};
