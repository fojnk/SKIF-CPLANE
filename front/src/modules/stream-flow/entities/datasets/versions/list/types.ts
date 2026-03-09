import { streamFlowApi } from '@/modules/stream-flow/shared/api';

export type updatesDC =
  streamFlowApi.dc.ResponsesCheckExperimentUpdateResponseDC;
export interface VersionsQuery {
  page: number;
  limit: number;
  dataset_id: number;
}
