import { createMutation } from '@farfetched/core';
import { createEvent, createStore, sample } from 'effector';

import { streamFlowApi } from '@/modules/stream-flow/shared/api';

import { AlertListModelV2 } from '../list_v2';

export function create() {
  const alertsEdit = createMutation({
    async handler(params: {
      experiment_id: number;
      product_id: number;
      alert_rules: streamFlowApi.dc.AlertsAlertRuleInputDC[];
    }) {
      return streamFlowApi.alerts.v2ExperimentAlertsTemplateUpdate(
        { experiment_id: params.experiment_id, product_id: params.product_id },
        {
          alert_rules: params.alert_rules,
        },
      );
    },
  });

  const edit = createEvent<{
    experiment_id: number;
    product_id: number;
    alert_rules: streamFlowApi.dc.AlertsAlertRuleInputDC[];
  }>();
  const reset = createEvent();
  const $loading = alertsEdit.$pending;
  const $failed = alertsEdit.$failed;
  const success = alertsEdit.finished.success;

  const $data =
    createStore<streamFlowApi.dc.V2ExperimentAlertsListDataDC | null>(
      null,
    ).reset(reset);

  sample({
    clock: edit,
    target: alertsEdit.start,
  });

  sample({
    clock: success,
    fn: ({ result }) => {
      return result.data;
    },
    target: AlertListModelV2.alertEditSuccess,
  });

  sample({
    clock: reset,
    target: alertsEdit.reset,
  });

  sample({
    clock: alertsEdit.finished.failure,
    fn: () => null,
    target: $data,
  });

  return {
    edit,
    reset,
    $data,
    $loading,
    $failed,
    success,
  };
}
