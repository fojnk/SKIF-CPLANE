import type { HttpResponse } from '@/shared/api';

export const isHttpResponse = (
  value: unknown,
  status?: number,
): value is HttpResponse<unknown> => {
  return (
    value instanceof Response &&
    'ok' in value &&
    (status == null || value.status === status)
  );
};
