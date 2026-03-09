import { createQuery } from '@farfetched/core';
import { createEvent, createStore, sample } from 'effector';
import { not } from 'patronum';

import { VariableCreateModel } from '@/modules/stream-flow/features/variable/create';
import { SetCurrentVersionModel } from '@/modules/stream-flow/features/variable/version/set-current';
import { streamFlowApi } from '@/modules/stream-flow/shared/api';

type VariableType = streamFlowApi.dc.DtoExperimentVariableShortDC;

type ResponseType = streamFlowApi.dc.ResponsesGetExperimentVariablesResponseDC;

const variablesQuery = createQuery({
  async handler(experiment_id: number) {
    const response = await streamFlowApi.experiment.v1ExperimentVariablesList({
      experiment_id,
    });
    return response.data;
  },
});

const reset = createEvent();
const removeVariable = createEvent<number>();
const updateVariable = createEvent<VariableType>();
const load = createEvent<number>();
const reload = createEvent();
const $data = createStore<VariableType[] | null>(null);
const $lastExperimentId = createStore<number | null>(null).reset(reset);

// Save last experiment_id and connect load event to query
sample({
  clock: load,
  filter: not(variablesQuery.$pending),
  target: [$lastExperimentId, variablesQuery.start],
});

// Reload with last experiment_id
sample({
  clock: reload,
  source: $lastExperimentId,
  filter: Boolean,
  target: variablesQuery.start,
});

// Connect query data to our store
sample({
  clock: variablesQuery.finished.success,
  fn: (payload: { result: ResponseType }) => payload.result?.variables ?? [],
  target: $data,
});

// Reset store when query is reset
sample({
  clock: reset,
  fn: () => null,
  target: $data,
});

// Update store when variable is removed
$data.on(removeVariable, (state, variable_id: number) => {
  if (!state) return state;
  return state.filter((variable: VariableType) => variable.id !== variable_id);
});

// Update store when variable is updated
$data.on(updateVariable, (state, updatedVariable: VariableType) => {
  if (!state) return state;
  return state.map((variable: VariableType) =>
    variable.id === updatedVariable.id ? updatedVariable : variable,
  );
});

// Перезагружаем список переменных после успешного restore версии
sample({
  clock: SetCurrentVersionModel.success,
  target: reload,
});

// Перезагружаем список переменных после успешного создания новой переменной
sample({
  clock: VariableCreateModel.success,
  target: reload,
});

export const list = {
  // Stores
  $data,
  $loading: variablesQuery.$pending,
  $failed: variablesQuery.$failed,
  // Events
  load,
  reset,
  reload,
  removeVariable,
  updateVariable,
};
