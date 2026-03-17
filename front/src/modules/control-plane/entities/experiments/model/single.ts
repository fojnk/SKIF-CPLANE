import { createQuery } from '@farfetched/core';
import { createEvent, createStore, sample } from 'effector';

import { controlPlaneApi } from '@/modules/control-plane/shared/api';
import { ControlPlaneError } from '@/modules/control-plane/shared/types';
import { createControlPlaneError } from '@/modules/control-plane/shared/utils/getErrors';
import { getResponse } from '@/shared/api/lib';

type ExperimentType =
  controlPlaneApi.dc.ResponsesGetCompleteExperimentsResponseDC;
type ExperimentAclType = controlPlaneApi.dc.AclRightDC;

export function create() {
  const dataQuery = createQuery({
    async handler(experiment_id: number) {
      const response = await controlPlaneApi.experiment.v1ExperimentList({
        experiment_id,
      });
      return response.data;
    },
  });
  const load = createEvent<number>();
  const refresh = createEvent();
  const reset = createEvent();

  const updateData = createEvent<Partial<ExperimentType>>();
  const $loading = dataQuery.$pending;
  const $failed = dataQuery.$failed;
  const success = dataQuery.finished.success;
  const $data = createStore<ExperimentType | null>(null).reset(reset);
  const $rights = createStore<ExperimentAclType[] | null>(null).reset(reset);
  const $errorCode = createStore<number | null>(null).reset(reset);
  const $id = createStore<number | null>(null).reset(reset);
  const $error = createStore<ControlPlaneError | null>(null).reset(reset);

  sample({
    clock: load,
    target: [dataQuery.start, $id],
  });

  sample({
    clock: refresh,
    source: $id,
    filter: Boolean,
    target: dataQuery.start,
  });

  sample({
    clock: success,
    fn: ({ result }) => {
      if (result) {
        return result;
      }
      return null;
    },
    target: $data,
  });

  sample({
    clock: dataQuery.finished.success,
    fn: ({ result }) => {
      if (result && result.rights) {
        return result.rights;
      }
      return null;
    },
    target: $rights,
  });

  sample({
    clock: dataQuery.finished.failure,
    fn: ({ error }) => {
      const response = getResponse(error);
      if (response && response.status) {
        return response.status;
      }
      return null;
    },
    target: $errorCode,
  });

  sample({
    clock: dataQuery.finished.failure,
    fn: ({ error }: any) => createControlPlaneError(error),
    target: $error,
  });

  sample({
    clock: dataQuery.finished.success,
    fn: () => null,
    target: $error,
  });

  // Обработчик для обновления данных
  sample({
    clock: updateData,
    source: $data,
    fn: (currentData, updates) => {
      if (currentData) {
        return {
          ...currentData,
          ...updates,
        };
      }
      return currentData;
    },
    target: $data,
  });

  sample({
    clock: reset,
    target: dataQuery.reset,
  });

  return {
    $data,
    success,
    $loading,
    $failed,
    $error,
    load,
    reset,
    $rights,
    updateData,
    $errorCode,
    refresh,
  };
}
