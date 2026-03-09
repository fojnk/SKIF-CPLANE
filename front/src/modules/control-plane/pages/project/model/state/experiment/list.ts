import { experimentsModel } from '@/modules/control-plane/entities/experiments';

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
  searchQueryChanged,
  $searchQuery,
  $filteredData,
} = experimentsModel.list.create();
