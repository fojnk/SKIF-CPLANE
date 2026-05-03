import { createQuery } from '@farfetched/core';
import { createEvent, createStore, sample } from 'effector';

import { controlPlaneApi } from '@/modules/control-plane/shared/api';
import { AclRightDC } from '@/modules/control-plane/shared/types';

type CheckQuery = controlPlaneApi.dc.V2AclCheckListParamsDC;

const isForbiddenError = (error: unknown): boolean =>
  typeof error === 'object' &&
  error !== null &&
  'status' in error &&
  Number((error as { status?: unknown }).status) === 403;

const usersQuery = createQuery({
  async handler(query: CheckQuery) {
    try {
      const result = await controlPlaneApi.acl.v2AclCheckList(query);
      return result.data;
    } catch (error) {
      if (isForbiddenError(error)) {
        return { rights: [] };
      }
      throw error;
    }
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
