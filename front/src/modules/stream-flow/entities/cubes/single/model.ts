import { createQuery } from '@farfetched/core';
import { createEvent, createStore, sample } from 'effector';

import { streamFlowApi } from '@/modules/stream-flow/shared/api';
import { CubeInfoDC } from '@/modules/stream-flow/shared/types';

export function create() {
  const dataQuery = createQuery({
    async handler(cube_id: number) {
      const response = await streamFlowApi.cube.v1CubeList({
        cube_id,
      });
      return response.data;
    },
  });
  const load = createEvent<number | null>();
  const reset = createEvent();
  const $data = createStore<CubeInfoDC | null>(null).reset(reset);
  const $loading = dataQuery.$pending;
  const $failed = dataQuery.$failed;

  const success = dataQuery.finished.success;
  sample({
    clock: load,
    filter: (value): value is number => value !== null,
    target: dataQuery.start,
  });

  sample({
    clock: reset,
    target: dataQuery.reset,
  });

  sample({
    clock: dataQuery.finished.success,
    fn: ({ result }) => {
      return result ?? null;
    },
    target: $data,
  });

  return {
    $data,
    $loading,
    $failed,
    load,
    reset,
    success,
  };
}
