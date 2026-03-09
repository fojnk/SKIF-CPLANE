import { createQuery } from '@farfetched/core';
import { createEvent, createStore, sample } from 'effector';

import { streamFlowApi } from '@/modules/stream-flow/shared/api';

type LinkType = streamFlowApi.dc.DtoExperimentURLDC;

export function create() {
  const dataQuery = createQuery({
    async handler(experiment_id: number) {
      const response = await streamFlowApi.experiment.v1ExperimentUrlsList({
        experiment_id,
      });
      return response.data;
    },
  });
  const load = createEvent<number>();
  const reset = createEvent();
  const $loading = dataQuery.$pending;
  const $failed = dataQuery.$failed;
  const success = dataQuery.finished.success;
  const $data = createStore<LinkType[] | null>(null).reset(reset);

  sample({
    clock: load,
    target: dataQuery.start,
  });

  sample({
    clock: success,
    fn: ({ result }) => {
      if (result && result.urls) {
        return result.urls;
      }
      return [];
    },
    target: $data,
  });

  sample({
    clock: reset,
    target: dataQuery.reset,
  });

  return {
    $data,
    $loading,
    $failed,
    load,
    reset,
  };
}
