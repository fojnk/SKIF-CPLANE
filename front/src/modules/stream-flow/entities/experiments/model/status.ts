import { createQuery } from '@farfetched/core';
import { createEvent, createStore, sample } from 'effector';

import { streamFlowApi } from '@/modules/stream-flow/shared/api';

type StatusType = streamFlowApi.dc.ResponsesExperimentStatusResponseDC;

export function create() {
  const dataQuery = createQuery({
    async handler(experiment_id: number) {
      const response = await streamFlowApi.experiment.v1ExperimentStatusList({
        experiment_id,
      });
      return response.data;
    },
  });
  const load = createEvent<number>();
  const reset = createEvent();
  const $data = createStore<StatusType | null>(null).reset(reset);
  const $loading = dataQuery.$pending;
  const $failed = dataQuery.$failed;

  sample({
    clock: load,
    target: dataQuery.start,
  });

  sample({
    clock: reset,
    target: dataQuery.reset,
  });

  sample({
    clock: dataQuery.finished.failure,
    fn: () => {
      return null;
    },
    target: $data,
  });

  sample({
    clock: dataQuery.finished.success,
    fn: ({ result }) => {
      return result;
    },
    target: $data,
  });

  return {
    $data,
    $loading,
    $failed,
    load,
    reset,
  };
}
