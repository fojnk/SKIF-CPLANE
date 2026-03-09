import { experimentsModel } from '@/modules/stream-flow/entities/experiments';

export const {
  load,
  $loading,
  $failed,
  reset,
  $data,
  $error,
  refresh,
  updateData,
} = experimentsModel.single.create();
