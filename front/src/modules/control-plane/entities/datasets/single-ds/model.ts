import { createQuery } from '@farfetched/core';
import { createEvent, createStore, sample } from 'effector';

import { controlPlaneApi } from '@/modules/control-plane/shared/api';
import {
  DatasetDC,
  DatasetV2DC,
  ControlPlaneError,
} from '@/modules/control-plane/shared/types';
import { createControlPlaneError } from '@/modules/control-plane/shared/utils/getErrors';

export function create() {
  const dataQuery = createQuery({
    async handler(dataset_id: number) {
      const response = await controlPlaneApi.dataset.v2DatasetList({
        dataset_id,
      });
      return response.data;
    },
  });
  const load = createEvent<number>();
  const reset = createEvent();
  const updateData = createEvent<Partial<DatasetDC>>();
  const $loading = dataQuery.$pending;
  const $failed = dataQuery.$failed;
  const $data = createStore<DatasetV2DC | null>(null).reset(reset);
  const $rights = createStore<controlPlaneApi.dc.AclRightDC[] | null>(null).reset(
    reset,
  );
  const $error = createStore<ControlPlaneError | null>(null).reset(reset);
  const success = dataQuery.finished.success;

  sample({
    clock: dataQuery.finished.success,
    fn: ({ result }) => {
      return result ?? null;
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
    clock: load,
    target: dataQuery.start,
  });

  sample({
    clock: reset,
    target: dataQuery.reset,
  });

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
    clock: dataQuery.finished.failure,
    fn: ({ error }: any) => createControlPlaneError(error),
    target: $error,
  });

  sample({
    clock: dataQuery.finished.success,
    fn: () => null,
    target: $error,
  });

  return {
    $loading,
    $failed,
    load,
    reset,
    $data,
    $rights,
    updateData,
    $error,
    success,
  };
}
