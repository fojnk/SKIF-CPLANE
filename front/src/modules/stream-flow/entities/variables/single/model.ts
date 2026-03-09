import { createQuery } from '@farfetched/core';
import { createEvent, createStore, sample } from 'effector';
import { not } from 'patronum';

import { streamFlowApi } from '@/modules/stream-flow/shared/api';

type VariableType = streamFlowApi.dc.DtoExperimentVariableDC;

type ResponseType = streamFlowApi.dc.ResponsesGetExperimentVariableResponseDC;

const variablesQuery = createQuery({
  async handler(variable_id: number) {
    const response = await streamFlowApi.experiment.v1ExperimentVariableList({
      variable_id,
    });
    return response.data;
  },
});

const reset = createEvent();
const load = createEvent<number>();
const $data = createStore<VariableType | null>(null);
const $lastExperimentId = createStore<number | null>(null).reset(reset);

// Save last experiment_id and connect load event to query
sample({
  clock: load,
  filter: not(variablesQuery.$pending),
  target: [$lastExperimentId, variablesQuery.start],
});

// Connect query data to our store
sample({
  clock: variablesQuery.finished.success,
  fn: (payload: { result: ResponseType }) => payload.result?.variable ?? null,
  target: $data,
});

// Reset store when query is reset
sample({
  clock: reset,
  fn: () => null,
  target: $data,
});

export const variable = {
  // Stores
  $data,
  $loading: variablesQuery.$pending,
  $failed: variablesQuery.$failed,
  // Events
  load,
  reset,
};
