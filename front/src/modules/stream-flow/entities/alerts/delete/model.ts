import { createMutation } from '@farfetched/core';
import { createEvent, createStore, sample } from 'effector';

import { streamFlowApi } from '@/modules/stream-flow/shared/api';

import { AlertListModelV2 } from '../list_v2';

export function create() {
  const alertsDelete = createMutation({
    async handler(params: {
      experiment_id: number;
      product_id: number;
      alert_group_id: number;
      deleting_rules: number[];
    }) {
      return streamFlowApi.alerts.v2ExperimentAlertsDelete(
        { experiment_id: params.experiment_id, product_id: params.product_id },
        {
          deleting_rules: params.deleting_rules,
          alert_group_id: params.alert_group_id,
        },
      );
    },
  });

  const remove = createEvent<{
    experiment_id: number;
    product_id: number;
    alert_group_id: number;
    deleting_rules: number[];
  }>();
  const reset = createEvent();
  const $loading = alertsDelete.$pending;
  const $failed = alertsDelete.$failed;
  const success = alertsDelete.finished.success;

  const $data =
    createStore<streamFlowApi.dc.V2ExperimentAlertsListDataDC | null>(
      null,
    ).reset(reset);

  sample({
    clock: remove,
    target: alertsDelete.start,
  });

  sample({
    clock: success,
    fn: ({ result }) => {
      return result.data;
    },
    target: AlertListModelV2.alertRemoveSuccess,
  });

  sample({
    clock: reset,
    target: alertsDelete.reset,
  });

  sample({
    clock: alertsDelete.finished.failure,
    fn: () => null,
    target: $data,
  });

  return {
    remove,
    reset,
    $data,
    $loading,
    $failed,
    success,
  };
}
