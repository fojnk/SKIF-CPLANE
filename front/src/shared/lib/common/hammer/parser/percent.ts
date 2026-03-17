import { clamp } from 'lodash-es';

import { typeGuard } from '@/shared/lib/common/type-guard';

export const percent = (
  value: Maybe<number>,
  maxValue: Maybe<number>,
  settings?: Maybe<{ clamped?: [number, number]; fallback?: number }>,
) => {
  const percentRaw = ((value || 0) / (maxValue || 0)) * 100;
  const percent = settings?.clamped
    ? clamp(percentRaw, settings.clamped[0], settings.clamped[1])
    : percentRaw;

  return typeGuard.isNumber(percentRaw) ? percent : settings?.fallback ?? 0;
};
