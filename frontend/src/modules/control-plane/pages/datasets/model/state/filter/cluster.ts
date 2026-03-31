import { dsClustersModel } from '@/modules/control-plane/entities/datasets/clusters';

export const { $loading, load, $failed, $data, reset } =
  dsClustersModel.create();
