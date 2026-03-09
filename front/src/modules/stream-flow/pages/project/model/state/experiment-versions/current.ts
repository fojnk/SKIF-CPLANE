import { experimentVersionsModel } from '@/modules/stream-flow/entities/experiment-versions';

export const { reload, $loading, $failed, reset, $data, $error, load } =
  experimentVersionsModel.current.create();
