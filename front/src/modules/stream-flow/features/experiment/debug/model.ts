import { createMutation } from '@farfetched/core';
import { createEvent, createStore, sample } from 'effector';

import { streamFlowApi } from '@/modules/stream-flow/shared/api';
import { notifications } from '@/shared/ui/notifications';

import { DebugExperimentPayload, DebugTabId, InputDataMode } from './types';

const debugMutation = createMutation({
  async handler(
    request: streamFlowApi.dc.RequestsExperimentValidateRunRequestDC,
  ) {
    const response =
      await streamFlowApi.experiment.v1ExperimentValidationsRunCreate(request);
    return response.data;
  },
});

const start = createEvent<DebugExperimentPayload>();
const reset = createEvent();
const setInputDataMode = createEvent<InputDataMode>();
const setActiveTab = createEvent<DebugTabId>();
const setSelectedCube = createEvent<string | null>();
const handleCubeClick = createEvent<string>();

// Store для режима input data
const $inputDataMode = createStore<InputDataMode>('yt_sample').on(
  setInputDataMode,
  (_, mode) => mode,
);

// Store для активного таба debug sidebar
const $activeTab = createStore<DebugTabId>('data')
  .on(setActiveTab, (_, tab) => tab)
  .reset(reset);

// Store для выбранного куба в Cubes tab
const $selectedCube = createStore<string | null>(null)
  .on(setSelectedCube, (_, cube) => cube)
  .reset(reset);

// Store для результата debug
const $result =
  createStore<streamFlowApi.dc.DtoValidationResponseWithRunDC | null>(
    null,
  ).reset(reset);

sample({
  clock: start,
  fn: (payload) => ({
    experiment_id: payload.experiment_id,
    config: payload.config,
    should_read_yt_sample: payload.should_read_yt_sample,
    data_sets: payload.data_sets,
  }),
  target: debugMutation.start,
});

sample({
  clock: debugMutation.finished.success,
  fn: ({ result }) => result,
  target: $result,
});

sample({
  clock: debugMutation.finished.failure,
  target: reset,
});

// Сбрасываем результат при изменении режима inputDataMode
sample({
  clock: setInputDataMode,
  target: reset,
});

// Обработка клика на куб: проверяем есть ли куб в результатах debug и переключаемся на него
sample({
  clock: handleCubeClick,
  source: $result,
  filter: (debugResult): debugResult is NonNullable<typeof debugResult> =>
    debugResult !== null,
  fn: (debugResult, cubeName) => {
    const cubeRuns = debugResult?.run_result?.batch_runs?.[0]?.cube_runs;
    if (cubeRuns && cubeRuns[cubeName]) {
      return cubeName;
    }
    return null;
  },
  target: setSelectedCube,
});

// При успешном выборе куба из debug результатов переключаемся на таб cubes
sample({
  clock: setSelectedCube,
  filter: (cubeName) => cubeName !== null,
  fn: () => 'cubes' as DebugTabId,
  target: setActiveTab,
});

const $pending = debugMutation.$pending;
const success = debugMutation.finished.success;
const failure = debugMutation.finished.failure;

notifications.attach(debugMutation, {
  success: ({ result }) => {
    const isValid = result.experiment_is_valid ?? false;
    return {
      type: isValid ? 'success' : 'warning',
      title: isValid ? 'Experiment is valid' : 'Completed with errors',
    };
  },
});

export {
  start,
  reset,
  $pending,
  $result,
  success,
  failure,
  setInputDataMode,
  $inputDataMode,
  setActiveTab,
  $activeTab,
  setSelectedCube,
  $selectedCube,
  handleCubeClick,
};
