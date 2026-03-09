import { createQuery } from '@farfetched/core';
import { createEvent, createStore, sample } from 'effector';

import { streamFlowApi } from '@/modules/stream-flow/shared/api';

export function create() {
  const alertsTemplatesList = createQuery({
    async handler() {
      return streamFlowApi.alerts.v2ExperimentAlertsOptionsList();
    },
  });

  const load = createEvent();
  const reset = createEvent();
  const $loading = alertsTemplatesList.$pending;
  const $failed = alertsTemplatesList.$failed;
  const success = alertsTemplatesList.finished.success;

  const $data =
    createStore<streamFlowApi.dc.V2ExperimentAlertsOptionsListDataDC | null>(
      null,
    ).reset(reset);

  sample({
    clock: load,
    target: alertsTemplatesList.start,
  });

  sample({
    clock: reset,
    target: alertsTemplatesList.reset,
  });

  sample({
    clock: success,
    fn: ({ result }) => {
      return result.data;
    },
    target: $data,
  });

  sample({
    clock: $failed,
    fn: () => null,
    target: $data,
  });

  return {
    load,
    reset,
    $loading,
    $failed,
    $data,
  };
}
