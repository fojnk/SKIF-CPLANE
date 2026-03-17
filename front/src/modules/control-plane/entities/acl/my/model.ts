import { createQuery } from '@farfetched/core';
import { createEvent, createStore, sample } from 'effector';

import { controlPlaneApi } from '@/modules/control-plane/shared/api';
import { AclRightDC } from '@/modules/control-plane/shared/types';

type CheckQuery = controlPlaneApi.dc.V2AclCheckListParamsDC;

const usersQuery = createQuery({
  async handler(query: CheckQuery) {
    const result = await controlPlaneApi.acl.v2AclCheckList(query);
    return result.data;
  },
});
const load = createEvent<CheckQuery>();
const reset = createEvent();
const $rights = createStore<AclRightDC[] | null>(null).reset(reset);
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
    return result?.rights ?? [];
  },
  target: $rights,
});

export { $rights, $loading, $failed, load, reset };
