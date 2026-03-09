import { experimentVersionsModel } from '@/modules/stream-flow/entities/experiment-versions';

export const { load, $loading, $failed, reset, $data, $notApplied, refresh } =
  experimentVersionsModel.updates.create();
