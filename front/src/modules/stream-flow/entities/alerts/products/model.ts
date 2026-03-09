import { createQuery } from '@farfetched/core';
import { createEvent, createStore, sample } from 'effector';

import { alertCreateSuccess } from '@/modules/stream-flow/entities/alerts/list_v2/model';
import { streamFlowApi } from '@/modules/stream-flow/shared/api';

export function create() {
  const products = createQuery({
    async handler(
      query: streamFlowApi.dc.V2ExperimentAlertsProductsListParamsDC,
    ) {
      return streamFlowApi.alerts.v2ExperimentAlertsProductsList({
        ...query,
      });
    },
  });

  const load =
    createEvent<streamFlowApi.dc.V2ExperimentAlertsProductsListParamsDC>();
  const reset = createEvent();
  const $loading = products.$pending;
  const $failed = products.$failed;
  const success = products.finished.success;
  const $data =
    createStore<streamFlowApi.dc.V2ExperimentAlertsProductsListDataDC | null>(
      null,
    ).reset(reset);

  sample({
    clock: load,
    target: products.start,
  });

  sample({
    clock: success,
    fn: ({ result }) => {
      if (!result.data) {
        return [];
      }

      return result.data;
    },
    target: $data,
  });

  sample({
    clock: reset,
    target: products.reset,
  });

  sample({
    clock: products.finished.failure,
    fn: () => null,
    target: $data,
  });

  sample({
    clock: alertCreateSuccess,
    source: $data,
    fn: (data, response) => {
      if (!Array.isArray(data)) return [];

      const id = response.notification_product_id;
      return [...data, id].filter(
        (item, index, arr) => arr.indexOf(item) === index,
      );
    },
    target: $data,
  });

  return {
    load,
    reset,
    $loading,
    $failed,
    $data,
    success,
  };
}
