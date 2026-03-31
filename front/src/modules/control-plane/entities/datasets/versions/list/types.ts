import { controlPlaneApi } from '@/modules/control-plane/shared/api';

export type updatesDC =
  controlPlaneApi.dc.ResponsesCheckExperimentUpdateResponseDC;
export interface VersionsQuery {
  page: number;
  limit: number;
  dataset_id: number;
}
