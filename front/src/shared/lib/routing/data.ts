import { getLocationQueryParams } from './lib';

export const baseQueryParams = getLocationQueryParams() as Record<
  string,
  string | undefined
>;
