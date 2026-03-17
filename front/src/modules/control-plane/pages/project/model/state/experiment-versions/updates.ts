import { experimentVersionsModel } from '@/modules/control-plane/entities/experiment-versions';

export const { load, $loading, $failed, reset, $data, $notApplied, refresh } =
  experimentVersionsModel.updates.create();
