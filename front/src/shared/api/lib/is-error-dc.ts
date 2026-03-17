import { controlPlaneApi } from '@/modules/control-plane/shared/api';
import { typeGuard } from '@/shared/lib/common/type-guard';

export const isErrorDC = (
  value: unknown,
): value is controlPlaneApi.dc.ResponsesErrorResponseDC => {
  return typeGuard.isObject(value) && 'error_message' in value;
};
