import { createQuery } from '@farfetched/core';
import { createEvent, createStore, sample } from 'effector';

import { streamFlowApi } from '@/modules/stream-flow/shared/api';

export const alertCreateSuccess =
  createEvent<streamFlowApi.dc.ResponsesGetAlertGroupResponseDC>();
export const alertRemoveSuccess =
  createEvent<streamFlowApi.dc.ResponsesGetAlertGroupResponseDC>();
export const alertEditSuccess =
  createEvent<streamFlowApi.dc.ResponsesGetAlertGroupResponseDC>();

export function create() {
  const alertsList = createQuery({
    async handler(query: streamFlowApi.dc.V2ExperimentAlertsListParamsDC) {
      return streamFlowApi.alerts.v2ExperimentAlertsList({
        ...query,
      });
    },
  });

  const load = createEvent<streamFlowApi.dc.V2ExperimentAlertsListParamsDC>();
  const reset = createEvent();
  const $loading = alertsList.$pending;
  const $failed = alertsList.$failed;
  const success = alertsList.finished.success;
  const $data =
    createStore<streamFlowApi.dc.V2ExperimentAlertsListDataDC | null>(
      null,
    ).reset(reset);

  sample({
    clock: load,
    target: alertsList.start,
  });

  sample({
    clock: [alertCreateSuccess, alertRemoveSuccess, alertEditSuccess],
    fn: (data) => {
      if (!data || !data.alerts) return data;
      data.alerts.sort((a, b) => a.alert_name.localeCompare(b.alert_name));
      return data;
    },
    target: $data,
  });

  sample({
    clock: success,
    fn: ({ result }) => {
      const data = result.data;
      if (!result.data || !result.data.alerts) return data;
      data.alerts.sort((a, b) => a.alert_name.localeCompare(b.alert_name));
      return data;
    },
    target: $data,
  });

  sample({
    clock: reset,
    target: alertsList.reset,
  });

  sample({
    clock: alertsList.finished.failure,
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
