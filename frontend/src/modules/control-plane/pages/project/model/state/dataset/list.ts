import { projectDsListModel } from '@/modules/control-plane/entities/datasets/project-ds-list';

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
