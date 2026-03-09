import { dsCurrentVersionModel } from '@/modules/control-plane/entities/datasets/versions/current';

export const { reload, $loading, $failed, reset, $data, $error, load } =
  dsCurrentVersionModel.create();
