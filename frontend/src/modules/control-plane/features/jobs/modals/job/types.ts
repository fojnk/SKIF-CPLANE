import { controlPlaneApi } from '@/modules/control-plane/shared/api';

export type JobModalProps = {
  id?: number;
  step_id?: number;
} & controlPlaneApi.dc.ClientsJobStageDC;
