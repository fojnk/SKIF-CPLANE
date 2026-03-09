import { dsCurrentVersionModel } from '@/modules/stream-flow/entities/datasets/versions/current';

export const { reload, $loading, $failed, reset, $data, $error, load } =
  dsCurrentVersionModel.create();
