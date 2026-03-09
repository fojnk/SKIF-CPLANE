import { dsExperimentsLinksModel } from '@/modules/stream-flow/entities/datasets/experiment-links-list';

export const { load, $loading, $failed, reset, $data, $error, $total } =
  dsExperimentsLinksModel.create();
