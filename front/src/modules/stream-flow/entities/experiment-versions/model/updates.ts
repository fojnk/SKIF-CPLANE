import { createQuery } from '@farfetched/core';
import { createEvent, createStore, sample } from 'effector';

import { updatesDC } from '@/modules/stream-flow/entities/experiment-versions';
import { streamFlowApi } from '@/modules/stream-flow/shared/api';
import { ControlPlaneError } from '@/modules/stream-flow/shared/types';
import { createControlPlaneError } from '@/modules/stream-flow/shared/utils/getErrors';

export function create() {
  const dataQuery = createQuery({
    async handler(experiment_id: number) {
      const response = await streamFlowApi.experiment.v1ExperimentUpdatesList({
        experiment_id,
      });
      return response.data;
    },
  });
  const reset = createEvent();
  const updateData = createEvent<updatesDC>();
  const $loading = dataQuery.$pending;
  const $failed = dataQuery.$failed;
  const success = dataQuery.finished.success;
  const load = createEvent<number | null>();
  const refresh = createEvent();
  const $data = createStore<updatesDC | null>(null).reset(reset);
  const $experimentId = createStore<number | null>(null).reset(reset);
  const $error = createStore<ControlPlaneError | null>(null).reset(reset);
  const $notApplied = $data.map((data) =>
    Boolean(data?.has_not_applied_changes),
  );

  sample({
    clock: load,
    filter: (value): value is number => value !== null,
    target: [dataQuery.start, $experimentId],
  });

  sample({
    clock: refresh,
    source: $experimentId,
    filter: Boolean,
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

  // Обработчик для обновления данных
  sample({
    clock: updateData,
    target: $data,
  });

  sample({
    clock: dataQuery.finished.failure,
    fn: ({ error }: any) => createControlPlaneError(error),
    target: $error,
  });

  sample({
    clock: dataQuery.finished.success,
    fn: () => null,
    target: $error,
  });

  return {
    $data,
    $notApplied,
    success,
    $loading,
    $failed,
    load,
    refresh,
    reset,
    $error,
    updateData,
  };
}
