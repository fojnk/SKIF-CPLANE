import { dsClustersModel } from '@/modules/stream-flow/entities/datasets/clusters';

export const { $loading, load, $failed, $data, reset } =
  dsClustersModel.create();
