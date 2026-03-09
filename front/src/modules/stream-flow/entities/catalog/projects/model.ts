import { createMutation } from '@farfetched/core';
import { createEvent, createStore, sample } from 'effector';

import { streamFlowApi } from '@/modules/stream-flow/shared/api';
import {
  ControlPlaneError,
  ProjectCatalog,
  SearchProjectRequest,
} from '@/modules/stream-flow/shared/types';
import { createControlPlaneError } from '@/modules/stream-flow/shared/utils/getErrors';

export function create() {
  const dataPost = createMutation({
    async handler(request: SearchProjectRequest) {
      const { search, ...restRequest } = request;
      const cleanRequest =
        search && search.trim() ? { ...restRequest, search } : restRequest;
      const response =
        await streamFlowApi.project.v2ProjectsCreate(cleanRequest);
      return response.data;
    },
  });

  const reset = createEvent();
  const success = dataPost.finished.success;
  const $data = createStore<ProjectCatalog[] | null>(null).reset(reset);
  const $loading = dataPost.$pending;
  const $failed = dataPost.$failed;
  const load = createEvent<SearchProjectRequest>();
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
      if (result && result.projects && result.projects.length > 0) {
        return result.projects;
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
