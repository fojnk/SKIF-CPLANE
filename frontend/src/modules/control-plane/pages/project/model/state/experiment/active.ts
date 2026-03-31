import { experimentsModel } from '@/modules/control-plane/entities/experiments';

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
