import { projectDsListModel } from '@/modules/stream-flow/entities/datasets/project-ds-list';

export const {
  load,
  $loading,
  $failed,
  reset,
  $data,
  remove,
  add,
  update,
  $error,
  refresh,
} = projectDsListModel.create();
