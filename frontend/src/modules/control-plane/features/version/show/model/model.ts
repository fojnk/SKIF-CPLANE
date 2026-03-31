import { createQuery } from '@farfetched/core';
import { createEvent, createStore, sample } from 'effector';

import { experimentVersionsModel } from '@/modules/control-plane/entities/experiment-versions';
import {
  ShowVersionPayload,
  ShowVersionMode,
} from '@/modules/control-plane/features/version/show';
import { controlPlaneApi } from '@/modules/control-plane/shared/api';
import { modalsModel } from '@/shared/ui/modals';

type RestoreDC =
  controlPlaneApi.dc.RequestsUpdateExperimentConfigVersionRequestDC;

const { load, $loading, $error, reset, $data, reload } =
  experimentVersionsModel.single.create();
const {
  load: loadHead,
  $loading: $loadingHead,
  reset: resetHead,
  $data: $dataHead,
  $error: $errorHead,
  reload: reloadHead,
} = experimentVersionsModel.single.create();

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
      await controlPlaneApi.experiment.v1ExperimentVersionCurrentUpdate(request);
    return response.data;
  },
});

const start = createEvent<ShowVersionPayload>();
const restoreVersion = createEvent<RestoreDC>();
const versionRestored = restoreMutation.finished.success;
const $pending = restoreMutation.$pending;

sample({
  clock: start,
  fn: ({ experiment_id, version_id }) => {
    return {
      experiment_id,
      version_id,
    };
  },
  target: load,
});
sample({
  clock: start,
  fn: ({ experiment_id, head_id }) => {
    return {
      experiment_id,
      version_id: head_id,
    };
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
