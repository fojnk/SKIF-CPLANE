import { experimentVersionsModel } from '@/modules/control-plane/entities/experiment-versions';

export const { reload, $loading, $failed, reset, $data, $error, load } =
  experimentVersionsModel.current.create();
