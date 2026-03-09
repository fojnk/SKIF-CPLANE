import { createQuery } from '@farfetched/core';
import { createEvent, createStore, sample } from 'effector';

import { dsVersionModel } from '@/modules/stream-flow/entities/datasets/versions/single';
import {
  ShowVersionPayload,
  ShowVersionMode,
} from '@/modules/stream-flow/features/dataset/version/show';
import { streamFlowApi } from '@/modules/stream-flow/shared/api';
import { modalsModel } from '@/shared/ui/modals';

type RestoreDC = streamFlowApi.dc.RequestsUpdateDatasetVersionRequestDC;

const { load, $loading, $error, reset, $data, reload } =
  dsVersionModel.create();
const {
  load: loadHead,
  $loading: $loadingHead,
  reset: resetHead,
  $data: $dataHead,
  $error: $errorHead,
  reload: reloadHead,
} = dsVersionModel.create();

const modal = modalsModel.register<ShowVersionPayload>({
  view: async () => (await import('../ui')).Modal,
});

// Управление режимом просмотра/восстановления/сравнения
const $mode = createStore<ShowVersionMode>('view').reset(reset);
const setMode = createEvent<ShowVersionMode>();

sample({
  clock: setMode,
  target: $mode,
});

const restoreMutation = createQuery({
  async handler(request: RestoreDC) {
    const response =
      await streamFlowApi.dataset.v2DatasetVersionCurrentUpdate(request);
    return response.data;
  },
});

const start = createEvent<ShowVersionPayload>();
const restoreVersion = createEvent<RestoreDC>();
const versionRestored = restoreMutation.finished.success;
const $pending = restoreMutation.$pending;

sample({
  clock: start,
  fn: ({ version_id }) => {
    return version_id;
  },
  target: load,
});
sample({
  clock: start,
  fn: ({ head_id }) => {
    return head_id;
  },
  target: loadHead,
});

// Устанавливаем режим из payload при открытии
sample({
  clock: start,
  fn: (payload) => payload.mode || 'view',
  target: $mode,
});

sample({
  clock: start,
  target: modal.open,
});

sample({
  clock: restoreVersion,
  target: restoreMutation.start,
});

sample({
  clock: versionRestored,
  target: modal.close,
});

sample({
  clock: modal.closed,
  target: [reset, resetHead],
});

export {
  start,
  load,
  $loading,
  $error,
  reset,
  $data,
  reload,
  restoreVersion,
  versionRestored,
  $pending,
  loadHead,
  $loadingHead,
  $dataHead,
  $errorHead,
  reloadHead,
  $mode,
  setMode,
};
