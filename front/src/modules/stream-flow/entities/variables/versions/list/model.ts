import { createQuery } from '@farfetched/core';
import { createEvent, createStore, sample } from 'effector';

import { SetCurrentVersionModel } from '@/modules/stream-flow/features/variable/version/set-current';
import { streamFlowApi } from '@/modules/stream-flow/shared/api';
import { VariableVersion } from '@/modules/stream-flow/shared/types';

type listQuery = streamFlowApi.dc.V2ExperimentVariableVersionsListParamsDC;

const listQuery = createQuery({
  async handler(query: listQuery) {
    const response =
      await streamFlowApi.experiment.v2ExperimentVariableVersionsList(query);
    return response.data;
  },
});

const load = createEvent<listQuery>();
const reset = createEvent();
const reload = createEvent();
const updateVersionComment = createEvent<{ id: number; comment?: string }>();
const $data = createStore<VariableVersion[] | null>(null).reset(reset);
const $total = createStore<number>(0).reset(reset);
const $loading = listQuery.$pending;
const $failed = listQuery.$failed;
const $lastQuery = createStore<listQuery | null>(null).reset(reset);

sample({
  clock: load,
  target: [$lastQuery, listQuery.start],
});

sample({
  clock: reload,
  source: $lastQuery,
  filter: Boolean,
  target: listQuery.start,
});

sample({
  clock: reset,
  target: listQuery.reset,
});

sample({
  clock: listQuery.finished.success,
  fn: ({ result }) => {
    return result && result.versions ? result.versions : [];
  },
  target: $data,
});

sample({
  clock: listQuery.finished.success,
  fn: ({ result }) => {
    return result && result.total ? result.total : 0;
  },
  target: $total,
});

sample({
  clock: updateVersionComment,
  source: $data,
  fn: (data, { id, comment }) => {
    if (!data) return data;
    return data.map((version) =>
      version.id === id ? { ...version, comment } : version,
    );
  },
  target: $data,
});

// Перезагружаем список после успешного restore версии
sample({
  clock: SetCurrentVersionModel.success,
  target: reload,
});

export {
  $data,
  $loading,
  $failed,
  load,
  reset,
  reload,
  $total,
  updateVersionComment,
};
