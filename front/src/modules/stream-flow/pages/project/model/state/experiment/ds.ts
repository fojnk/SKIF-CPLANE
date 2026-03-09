import { experimentsModel } from '@/modules/stream-flow/entities/experiments';

export const { load, $loading, $failed, reset, $data, remove, rename, add } =
  experimentsModel.ds.create();
