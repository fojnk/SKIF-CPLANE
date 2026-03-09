import { createEvent, createStore, sample } from 'effector';

import { cubesListModel } from '@/modules/stream-flow/entities/cubes/list';
import { CubesMarketPayload } from '@/modules/stream-flow/features/cubes/market';
import { CubeInfoDC } from '@/modules/stream-flow/shared/types';
import { modalsModel } from '@/shared/ui/modals';

const {
  load: loadCubesList,
  $loading: $loadingCubesList,
  $data: $cubesList,
  success: successCubesList,
  $failed: $failedCubesList,
} = cubesListModel;

const modal = modalsModel.register<CubesMarketPayload>({
  view: async () => (await import('../ui')).Modal,
});

const start = createEvent<CubesMarketPayload>();
const reset = createEvent();
const setSelectedCubeId = createEvent<number | null>();
const checkout = createEvent<CubeInfoDC>();
const $selectedCubeId = createStore<number | null>(null).reset(reset);

sample({
  clock: start,
  fn: (payload) => {
    return payload.cubeId ?? null;
  },
  target: setSelectedCubeId,
});

sample({
  clock: start,
  target: [loadCubesList, modal.open],
});

sample({
  clock: start,
  source: $cubesList,
  filter: (cubes) => cubes !== null && cubes.length > 0,
  fn: (cubes, payload) => {
    return payload.cubeId ? payload.cubeId : cubes![0].id!;
  },
  target: setSelectedCubeId,
});

sample({
  clock: successCubesList,
  source: $selectedCubeId,
  filter: (selected) => selected === null,
  fn: (_selected, response) => {
    return response.result &&
      response.result.cubes &&
      response.result.cubes.length > 0
      ? response.result.cubes[0].id!
      : null;
  },
  target: setSelectedCubeId,
});

sample({
  clock: setSelectedCubeId,
  filter: Boolean,
  target: $selectedCubeId,
});

sample({
  clock: checkout,
  target: modal.close,
});

export {
  reset,
  start,
  loadCubesList,
  setSelectedCubeId,
  checkout,
  $cubesList,
  $loadingCubesList,
  $failedCubesList,
  $selectedCubeId,
};
