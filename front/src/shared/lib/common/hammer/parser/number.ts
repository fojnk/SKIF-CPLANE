import BigNumber from 'bignumber.js';

import { hammer } from '@/shared/lib/common/hammer';
import { typeGuard } from '@/shared/lib/common/type-guard';

export const number = (input: Maybe<string | number | BigNumber>) => {
  if (typeGuard.isNumber(input)) {
    return input;
  }

  if (typeGuard.isString(input)) {
    return Number(hammer.format.skipSpaces(input));
  }

  if (BigNumber.isBigNumber(input)) {
    return input.toNumber();
  }

  return 0;
};
