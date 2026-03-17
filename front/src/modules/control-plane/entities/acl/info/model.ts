import { combine, createEvent, createStore, sample } from 'effector';

import { MyRightsModel } from '@/modules/control-plane/entities/acl/my';
import { UsersRightsModel } from '@/modules/control-plane/entities/acl/users';
import {
  getUsersInitialPageSize,
  saveUsersPageSize,
} from '@/modules/control-plane/shared/utils/pageDataHelpers';

const {
  load: loadUsers,
  $loading: $loadingUsers,
  $failed: $failedUsers,
  reset: resetUsers,
  $users,
  $total,
} = UsersRightsModel;

const {
  load: loadRights,
  $loading: $loadingMy,
  $failed: $failedMy,
  reset: resetMy,
  $rights,
} = MyRightsModel;

// Filter
const updateFilter = createEvent<
  Partial<{
    search: string;
    offset: number;
    limit: number;
    object_id: number;
    object_type: string;
  }>
>();
const reset = createEvent();

type Filter = {
  search: string;
  offset: number;
  limit: number;
  object_id: number;
  object_type: string;
};

const $filter = createStore<Filter>({
  search: '',
  offset: 0,
  limit: getUsersInitialPageSize(),
  object_id: 0,
  object_type: '',
});

const $loading = combine(
  $loadingMy,
  $loadingUsers,
  (loadingMy, loadingUsers) => loadingMy || loadingUsers,
);

// Update filter
$filter.on(updateFilter, (state, updates) => {
  const newState = { ...state, ...updates };

  if (updates.limit !== undefined) {
    saveUsersPageSize(updates.limit);
  }

  return newState;
});

// Load users when filter changes
sample({
  clock: updateFilter,
  source: $filter,
  fn: (currentFilter, updates) => ({
    object_id: updates.object_id ?? currentFilter.object_id,
    object_type: updates.object_type ?? currentFilter.object_type,
    offset: updates.offset ?? currentFilter.offset,
    limit: updates.limit ?? currentFilter.limit,
    search: updates.search ?? currentFilter.search,
  }),
  target: loadUsers,
});

sample({
  clock: reset,
  target: [resetUsers, resetMy],
});

export {
  loadUsers,
  loadRights,
  reset,
  updateFilter,
  $loading,
  $users,
  $rights,
  $failedUsers,
  $failedMy,
  $total,
  $filter,
};
