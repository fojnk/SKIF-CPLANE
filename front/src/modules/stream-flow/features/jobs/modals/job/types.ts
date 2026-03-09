import { streamFlowApi } from '@/modules/stream-flow/shared/api';

export type JobModalProps = {
  id?: number;
  step_id?: number;
} & streamFlowApi.dc.JobdStageDC;
