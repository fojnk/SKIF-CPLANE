import { experimentsModel } from '@/modules/control-plane/entities/experiments';

export const { load, $loading, $failed, reset, $data, remove, rename, add } =
  experimentsModel.ds.create();
