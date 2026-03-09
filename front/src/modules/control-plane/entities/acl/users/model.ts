import { createQuery } from '@farfetched/core';
import { createEvent, createStore, sample } from 'effector';

import { controlPlaneApi } from '@/modules/control-plane/shared/api';
import { UserRightsDC } from '@/modules/control-plane/shared/types';

type UsersQuery = controlPlaneApi.dc.V2AclUsersListParamsDC;

const usersQuery = createQuery({
  async handler(query: UsersQuery) {
    const result = await controlPlaneApi.acl.v2AclUsersList(query);
    return result.data;
  },
});
const load = createEvent<UsersQuery>();
const reset = createEvent();
const $users = createStore<UserRightsDC[] | null>(null).reset(reset);
const $total = createStore<number>(0).reset(reset);
const $loading = usersQuery.$pending;
const $failed = usersQuery.$failed;

sample({
  clock: load,
  target: usersQuery.start,
});

sample({
  clock: reset,
  target: usersQuery.reset,
});

sample({
  clock: usersQuery.finished.success,
  fn: ({ result }) => {
    return result?.users ?? [];
  },
  target: $users,
});

sample({
  clock: usersQuery.finished.success,
  fn: ({ result }) => {
    return result?.total ?? 0;
  },
  target: $total,
});

export { $users, $loading, $failed, load, reset, $total };
