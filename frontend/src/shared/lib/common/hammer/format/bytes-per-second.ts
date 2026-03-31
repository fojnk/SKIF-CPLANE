import { typeGuard } from '@/shared/lib/common/type-guard';

import { bytes } from './bytes';
import { NO_VALUE } from './constants';

export const bytesPerSecond = function (
  value: Maybe<string | number>,
  settings?: { digits?: number; defaultPostfix?: string },
) {
  if (typeGuard.isNumber(value)) {
    return bytes(value, settings) + '/s';
  } else {
    return NO_VALUE;
  }
};
