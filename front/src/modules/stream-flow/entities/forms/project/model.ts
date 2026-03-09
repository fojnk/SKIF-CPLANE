import { createQuery } from '@farfetched/core';
import { createEvent, createStore, sample } from 'effector';

import { streamFlowApi } from '@/modules/stream-flow/shared/api';
import { ParamsDC } from '@/modules/stream-flow/shared/types';

const dataQuery = createQuery({
  async handler() {
    const response = await streamFlowApi.form.v2FormsProjectList();
    return response.data;
  },
});

const load = createEvent();
const reset = createEvent();
const $data = createStore<ParamsDC[] | null>(null).reset(reset);
const $loading = dataQuery.$pending;
const $failed = dataQuery.$failed;

sample({
  clock: load,
  source: { pending: dataQuery.$pending, data: $data },
  filter: ({ pending, data }) => !pending && data === null,
  target: dataQuery.start,
});

sample({
  clock: reset,
  target: dataQuery.reset,
});

sample({
  clock: dataQuery.finished.success,
  fn: ({ result }) => {
    return result && result.params ? result.params : null;
  },
  target: $data,
});

export { $data, $loading, $failed, load, reset };
