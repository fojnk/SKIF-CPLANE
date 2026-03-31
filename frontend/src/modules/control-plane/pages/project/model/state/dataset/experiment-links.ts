import { dsExperimentsLinksModel } from '@/modules/control-plane/entities/datasets/experiment-links-list';

export const { load, $loading, $failed, reset, $data, $error, $total } =
  dsExperimentsLinksModel.create();
