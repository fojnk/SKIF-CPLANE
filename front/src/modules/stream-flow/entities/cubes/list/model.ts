import { createQuery } from '@farfetched/core';
import { createEvent, createStore, sample } from 'effector';

import { streamFlowApi } from '@/modules/stream-flow/shared/api';
import { CubeListDC } from '@/modules/stream-flow/shared/types';

export function create() {
  const dataQuery = createQuery({
    async handler() {
      const response = await streamFlowApi.cube.v1CubesList();
      return response.data;
    },
  });
  const reset = createEvent();
  const $data = createStore<CubeListDC[] | null>(null).reset(reset);
  const $loading = dataQuery.$pending;
  const $failed = dataQuery.$failed;
  const load = createEvent();
  const success = dataQuery.finished.success;

  sample({
    clock: load,
    source: { pending: dataQuery.$pending, data: $data },
    filter: ({ pending, data }) => !pending && data === null,
    target: dataQuery.start,
  });

  sample({
    clock: reset,
    target: dataQuery.reset,
  });

  sample({
    clock: success,
    fn: ({ result }) => result?.cubes ?? [],
    target: $data,
  });

  sample({
    clock: dataQuery.finished.failure,
    fn: () => null,
    target: $data,
  });

  return {
    $loading,
    load,
    $failed,
    $data,
    reset,
    success,
  };
}

export const { $loading, load, $failed, $data, reset, success } = create();
