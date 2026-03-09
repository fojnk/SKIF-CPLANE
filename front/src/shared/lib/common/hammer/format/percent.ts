import { hammer } from '@/shared/lib/common/hammer';
import { typeGuard } from '@/shared/lib/common/type-guard';

import { NO_VALUE } from './constants';
import { parseSetting } from './utils';

export const percent = function (
  value: Maybe<number | string>,
  settings?: {
    digits?: number;
    divider?: string;
    symbol?: string;
    emptyText?: string;
  },
) {
  const digits = parseSetting(settings, 'digits', 2);
  const divider = parseSetting(settings, 'divider', '.');
  const symbol = parseSetting(settings, 'symbol', '%');
  const emptyText = parseSetting(settings, 'emptyText', NO_VALUE);
  if (typeGuard.isNumber(+`${value}`)) {
    const fixedNumber = `${+hammer.parser.number(value).toFixed(digits)}`;
    return (
      (divider === '.' ? fixedNumber : fixedNumber.replace('.', divider)) +
      symbol
    );
  } else {
    return emptyText;
  }
};
