import { createQuery } from '@farfetched/core';
import { createEvent, createStore, sample } from 'effector';

import { controlPlaneApi } from '@/modules/control-plane/shared/api';

type GrafanaUrlType = controlPlaneApi.dc.DtoExperimentURLDC;

export function create() {
  const dataQuery = createQuery({
    async handler(experiment_id: number) {
      const response =
        await controlPlaneApi.experiment.v1ExperimentGrafanaUrlList({
          experiment_id,
        });
      return response.data;
    },
  });
  const reset = createEvent();
  const $loading = dataQuery.$pending;
  const $failed = dataQuery.$failed;
  const success = dataQuery.finished.success;
  const load = createEvent<number>();
  const $data = createStore<GrafanaUrlType | null>(null).reset(reset);

  sample({
    clock: load,
    target: dataQuery.start,
  });

  sample({
    clock: success,
    fn: ({ result }) => {
      return result ?? null;
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
