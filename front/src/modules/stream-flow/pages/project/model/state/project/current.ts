import { projectDataModel } from '@/modules/stream-flow/entities/projects/single';

export const {
  load,
  reload,
  $loading,
  $failed,
  reset,
  $data,
  updateData,
  $error,
  pin,
  unpin,
} = projectDataModel.create();
