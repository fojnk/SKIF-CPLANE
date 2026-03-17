import { createMutation } from '@farfetched/core';
import { createEvent, createStore, sample } from 'effector';

import { controlPlaneApi } from '@/modules/control-plane/shared/api';
import {
  ControlPlaneError,
  DsExperimentLinkDC,
} from '@/modules/control-plane/shared/types';
import { createControlPlaneError } from '@/modules/control-plane/shared/utils/getErrors';

type DsListRequest = controlPlaneApi.dc.V2DatasetLinksListParamsDC;

export function create() {
  const dataPost = createMutation({
    async handler(request: DsListRequest) {
      const response = await controlPlaneApi.dataset.v2DatasetLinksList(request);
      return response.data;
    },
  });

  const reset = createEvent();
  const success = dataPost.finished.success;
  const $data = createStore<DsExperimentLinkDC[] | null>(null).reset(reset);
  const $loading = dataPost.$pending;
  const $failed = dataPost.$failed;
  const load = createEvent<DsListRequest>();
  const $error = createStore<ControlPlaneError | null>(null).reset(reset);
  const $total = createStore<number>(0).reset(reset);

  sample({
    clock: load,
    target: dataPost.start,
  });

  sample({
    clock: reset,
    target: dataPost.reset,
  });

  sample({
    clock: success,
    fn: ({ result }) => {
      if (result && result.links) {
        return result.links;
      }
      return [];
    },
    target: $data,
  });

  sample({
    clock: success,
    fn: ({ result }) => {
      return result?.total ?? 0;
    },
    target: $total,
  });

  sample({
    clock: dataPost.finished.failure,
    fn: ({ error }: any) => createControlPlaneError(error),
    target: $error,
  });

  sample({
    clock: dataPost.finished.success,
    fn: () => null,
    target: $error,
  });

  return {
    $data,
    $loading,
    $failed,
    load,
    reset,
    success,
    $error,
    $total,
  };
}
