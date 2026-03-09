import { createMutation } from '@farfetched/core';
import { createEvent, createStore, sample } from 'effector';

import { streamFlowApi } from '@/modules/stream-flow/shared/api';

import { AlertListModelV2 } from '../list_v2';

export function create() {
  const alertsCreate = createMutation({
    async handler(params: {
      experiment_id: number;
      product_id: number;
      alert_rules: streamFlowApi.dc.AlertsAlertRuleInputDC[];
    }) {
      return streamFlowApi.alerts.v2ExperimentAlertsCreate(
        { experiment_id: params.experiment_id, product_id: params.product_id },
        {
          alert_rules: params.alert_rules,
        },
      );
    },
  });

  const load = createEvent<{
    experiment_id: number;
    product_id: number;
    alert_rules: streamFlowApi.dc.AlertsAlertRuleInputDC[];
  }>();
  const reset = createEvent();
  const $loading = alertsCreate.$pending;
  const $failed = alertsCreate.$failed;
  const success = alertsCreate.finished.success;

  const $data =
    createStore<streamFlowApi.dc.V2ExperimentAlertsListDataDC | null>(
      null,
    ).reset(reset);
  const $lastCreatedProductId = createStore<string | null>(null).reset(reset);

  sample({
    clock: load,
    target: alertsCreate.start,
  });

  sample({
    clock: success,
    fn: ({ result }) => {
      return result.data;
    },
    target: AlertListModelV2.alertCreateSuccess,
  });

  sample({
    clock: success,
    fn: ({ result }) => {
      const notificationProductId =
        result.data?.notification_product_id?.toString();
      return notificationProductId || null;
    },
    target: $lastCreatedProductId,
  });

  sample({
    clock: reset,
    target: alertsCreate.reset,
  });

  sample({
    clock: alertsCreate.finished.failure,
    fn: () => null,
    target: $data,
  });

  return {
    load,
    reset,
    $data,
    $loading,
    $failed,
    success,
    $lastCreatedProductId,
  };
}
