import BigNumber from 'bignumber.js';

import { hammer } from '@/shared/lib/common/hammer';
import { BinaryByteUnit } from '@/shared/lib/common/hammer/parser';

import { NO_VALUE } from './constants';
import { parseSetting } from './utils';

BigNumber.config({
  FORMAT: {
    decimalSeparator: '.',
    groupSeparator: ' ',
    groupSize: 3,
    secondaryGroupSize: 3,
  },
});

export const bytes = function (
  value: Maybe<number | string | BigNumber>,
  settings?: {
    digits?: number;
    defaultPostfix?: string;
    onlySymbol?: boolean;
    onlyValue?: boolean;
    emptyText?: string;
    target?: Maybe<BinaryByteUnit> | false;
    cutZeros?: boolean;
  },
) {
  let digits = parseSetting(settings, 'digits', 2);
  const defaultPostfix = parseSetting(settings, 'defaultPostfix', 'B');
  const onlySymbol = parseSetting(settings, 'onlySymbol', false);
  const emptyText = parseSetting(settings, 'emptyText', NO_VALUE);
  const target = parseSetting(settings, 'target', false);
  const onlyValue = parseSetting(settings, 'onlyValue', false);
  const cutZeros = parseSetting(settings, 'cutZeros', false);
  let len;
  let i;

  try {
    value = new BigNumber(value as number) as BigNumber;

    if (value.isNaN()) {
      if (onlySymbol) return '';
      return emptyText;
    }

    const formatted = {
      symbol: '',
      number: '',
    };

    const isNegative = value.isNegative();
    const sign = isNegative ? '-' : '';

    value = value.abs();

    if (target) {
      const divider = hammer.parser.BIN_NUMBERS[target];

      value = value.dividedBy(divider);

      formatted.symbol = target;
      formatted.number = `${sign}${hammer.format.fixedNumber(value, {
        digits,
        cutZeros,
      })}`;
    } else {
      // Divide bytes by 1 KiB until remainder is smaller than 1 KiB or list of names has ended
      for (
        i = 0, len = hammer.parser.BIN_NAMES.length;
        i < len - 1 && value.gte(hammer.parser.BIN_NUMBERS['KiB']);
        i++,
          value = (value as BigNumber).dividedBy(
            hammer.parser.BIN_NUMBERS['KiB'],
          )
      ) {
        continue;
      }

      digits = i === 0 ? 0 : digits;

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (value === 0) {
        formatted.symbol = defaultPostfix;
        formatted.number = hammer.format.fixedNumber(value, {
          digits,
          cutZeros,
        });
      } else {
        formatted.symbol = hammer.parser.BIN_NAMES[i];
        formatted.number = `${sign}${hammer.format.fixedNumber(value, {
          digits,
          cutZeros,
        })}`;
      }
    }

    if (onlySymbol) {
      return formatted.symbol;
    }
    if (onlyValue) {
      return formatted.number;
    }

    return `${formatted.number} ${formatted.symbol}`;
    // eslint-disable-next-line no-empty
  } catch (_e) {}

  if (onlySymbol) return '';

  return emptyText;
};
