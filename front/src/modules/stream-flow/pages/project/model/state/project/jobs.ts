import { jobsModel } from '@/modules/stream-flow/entities/jobs';

export const { load, $loading, $failed, $data, success, reset, $total } =
  jobsModel.create();
