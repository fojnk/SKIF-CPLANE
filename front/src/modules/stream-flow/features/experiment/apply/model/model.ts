import { createMutation } from '@farfetched/core';
import { createEvent, createStore, createEffect, sample } from 'effector';

import { experimentVersionsModel } from '@/modules/stream-flow/entities/experiment-versions';
import { ApplyExperimentPayload } from '@/modules/stream-flow/features/experiment/apply';
import { streamFlowApi } from '@/modules/stream-flow/shared/api';
import { HttpResponse, httpRequestFailed } from '@/shared/api';
import { modalsModel } from '@/shared/ui/modals';
import { notifications } from '@/shared/ui/notifications';

const { load, $loading, $failed, reset, $data } =
  experimentVersionsModel.updates.create();

const modal = modalsModel.register<ApplyExperimentPayload>({
  view: async () => (await import('../ui')).Modal,
});

const applyMutation = createMutation({
  async handler(experiment_id: number) {
    const response =
      await streamFlowApi.experiment.v1ExperimentConfigApplyUpdate({
        experiment_id,
      });
    return response.data;
  },
});

// Эффект для обработки ошибки
const processErrorFx = createEffect(
  async (response: HttpResponse<unknown, unknown>) => {
    let error;
    try {
      error = await response.json();
    } catch {
      error = response.error;
    }
    return { error };
  },
);

const start = createEvent<ApplyExperimentPayload>();
const $pending = applyMutation.$pending;
const success = applyMutation.finished.success;
const onApply = createEvent<number>();
const setTab = createEvent<'diff' | 'error'>();

// Store для активной вкладки
const $tab = createStore<'diff' | 'error'>('diff');

// Store для ошибки
const $error = createStore<string | null>(null);

sample({
  clock: start,
  target: [
    modal.open,
    load.prepend((payload: ApplyExperimentPayload) => {
      return payload.experiment_id;
    }),
  ],
});

sample({
  clock: success,
  target: modal.close,
});

sample({
  clock: modal.closed,
  target: reset,
});

sample({
  clock: onApply,
  target: applyMutation.start,
});

// Сбрасываем tab и error при reset
sample({
  clock: reset,
  target: [$tab.reinit, $error.reinit],
});

// Обрабатываем ошибку через httpRequestFailed
sample({
  clock: httpRequestFailed,
  filter: (response) =>
    response.url.includes('_stream-flow/api/v1/experiment/config/apply'),
  target: processErrorFx,
});

sample({
  clock: processErrorFx.doneData,
  fn: ({ error }) => {
    const errorMessage =
      error && 'error' in error
        ? error.error
        : error && 'message' in error
          ? error.message
          : null;
    return errorMessage;
  },
  target: $error,
});

// Удаляем этот sample, так как теперь обрабатываем ошибку напрямую

// Переключаемся на вкладку error при возникновении ошибки
sample({
  clock: applyMutation.finished.failure,
  fn: () => 'error' as const,
  target: $tab,
});

// Обрабатываем изменение tab
sample({
  clock: setTab,
  target: $tab,
});

notifications.attach(applyMutation, {
  success: () => {
    return {
      type: 'success',
      title: 'Config applied',
    };
  },
});

export {
  start,
  $pending,
  success,
  onApply,
  load,
  $loading,
  $failed,
  reset,
  $data,
  $tab,
  $error,
  setTab,
};
