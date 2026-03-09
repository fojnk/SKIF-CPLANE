import { createEvent, createStore, sample } from 'effector';

import { namespacesModel } from '@/modules/stream-flow/entities/namespaces/list';

export const {
  $loading,
  load,
  $failed,
  $data,
  reset,
  add,
  update,
  remove,
  success,
  $error,
  $canCreate,
} = namespacesModel.create();

export const $search = createStore<string>('').reset(reset);
export const setSearch = createEvent<string>();

sample({
  clock: setSearch,
  target: $search,
});
