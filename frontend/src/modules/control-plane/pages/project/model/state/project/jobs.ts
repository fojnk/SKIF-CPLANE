import { jobsModel } from '@/modules/control-plane/entities/jobs';

export const { load, $loading, $failed, $data, success, reset, $total } =
  jobsModel.create();
