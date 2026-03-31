import { typeGuard } from '@/shared/lib/common/type-guard';

import { NO_VALUE } from './constants';
import { parseSetting } from './utils';

/**
 * Allows to strip port from fqdn
 */
export const address = function (
  value: Maybe<string>,
  settings?: Maybe<AnyObject>,
) {
  if (typeGuard.isString(value)) {
    const preservePort = parseSetting(settings, 'format') === 'port';

    return preservePort ? value : value && value.split(':')[0];
  } else {
    return NO_VALUE;
  }
};
