import { createQuery } from '@farfetched/core';
import { createEvent, createStore, sample } from 'effector';

import { controlPlaneApi } from '@/modules/control-plane/shared/api';

import { ProjectJobsQuery } from './types';

export function create() {
  const dataQuery = createQuery({
    async handler(query: controlPlaneApi.dc.RequestsListJobsRequestDC) {
      const response = await controlPlaneApi.jobs.v1JobsSearchCreate({
        ...query,
      });

      return response.data;
    },
  });

  const load = createEvent<ProjectJobsQuery>();
  const reset = createEvent();
  const $loading = dataQuery.$pending;
  const $failed = dataQuery.$failed;
  const success = dataQuery.finished.success;
  const $data =
    createStore<controlPlaneApi.dc.ResponsesListJobsResponseDC | null>(
      null,
    ).reset(reset);
  const $total = createStore<number>(0).reset(reset);

  sample({
    clock: load,
    target: dataQuery.start,
  });

  sample({
    clock: success,
    fn: ({ result }) => {
      return result;
    },
    target: $data,
  });

  sample({
    clock: reset,
    target: dataQuery.reset,
  });

  sample({
    clock: success,
    fn: ({ result }) => {
      return result?.total ?? 0;
    },
    target: $total,
  });

  return {
    load,
    reset,
    $loading,
    $failed,
    success,
    $data,
    $total,
  };
}
