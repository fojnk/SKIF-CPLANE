const pluralize = (value: number, unit: string): string => {
  return `${value} ${unit}${value !== 1 ? 's' : ''} ago`;
};

const normalizeIsoToMsPrecision = (isoString: string): string => {
  // Trim fractional seconds to milliseconds to ensure consistent parsing
  // Example: 2025-08-29T08:07:48.711339Z -> 2025-08-29T08:07:48.711Z
  return isoString.replace(/\.(\d{3})\d+(Z|[+-]\d{2}:\d{2})$/, '.$1$2');
};

export const getAgoTime = (isoString: string): string => {
  const normalized = normalizeIsoToMsPrecision(isoString);
  const timestamp = Date.parse(normalized);

  if (Number.isNaN(timestamp)) return 'just now';

  const now = Date.now();
  const diffMs = Math.max(0, now - timestamp);

  const minuteMs = 60_000;
  const hourMs = 60 * minuteMs;
  const dayMs = 24 * hourMs;
  const monthMs = 30 * dayMs; // approximate month length
  const yearMs = 365 * dayMs; // non-leap approximation

  const years = Math.floor(diffMs / yearMs);
  if (years > 0) return pluralize(years, 'year');

  const months = Math.floor(diffMs / monthMs);
  if (months > 0) return pluralize(months, 'month');

  const days = Math.floor(diffMs / dayMs);
  if (days > 0) return pluralize(days, 'day');

  const hours = Math.floor(diffMs / hourMs);
  if (hours > 0) return pluralize(hours, 'hour');

  const minutes = Math.floor(diffMs / minuteMs);
  if (minutes > 0) return pluralize(minutes, 'minute');

  return 'just now';
};

export default getAgoTime;
