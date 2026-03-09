import { streamFlowApi } from '@/modules/stream-flow/shared/api';
import { typeGuard } from '@/shared/lib/common/type-guard';

export const isErrorDC = (
  value: unknown,
): value is streamFlowApi.dc.ResponsesErrorResponseDC => {
  return typeGuard.isObject(value) && 'error_message' in value;
};
