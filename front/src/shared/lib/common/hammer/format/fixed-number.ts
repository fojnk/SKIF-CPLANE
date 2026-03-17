import BigNumber from 'bignumber.js';

import { hammer } from '@/shared/lib/common/hammer';

import { parseSetting } from './utils';

export const fixedNumber = (
  value: Maybe<number | BigNumber>,
  settings?: { digits?: number; cutZeros?: boolean },
) => {
  const digits = parseSetting(settings, 'digits', 2);
  const cutZeros = parseSetting(settings, 'cutZeros', false);

  const fixed = hammer.parser.number(value).toFixed(digits);

  if (cutZeros) {
    return `${+fixed}`;
  }

  return fixed;
};
