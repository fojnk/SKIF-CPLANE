import { createEvent, createStore, sample } from 'effector';

import { SFModule } from '@/modules/stream-flow/config';
import {
  ProjectNavigateParams,
  BreadParams,
  ProjectSelectedItem,
} from '@/modules/stream-flow/features/navigation';
import { $data as $datasetData } from '@/modules/stream-flow/pages/project/model/state/dataset/active';
import { $data as $experimentData } from '@/modules/stream-flow/pages/project/model/state/experiment/active';
import {
  $data,
  reset,
} from '@/modules/stream-flow/pages/project/model/state/project/current';
import {
  $selected as $selectedQuery,
  setDataset,
  setExperiment,
} from '@/modules/stream-flow/pages/project/model/state/selected';

export const navigate = createEvent<ProjectNavigateParams>();
export const $bread = createStore<BreadParams | null>(null).reset(reset);
export const $selected = createStore<ProjectSelectedItem | null>(null).reset(
  reset,
);
export { $selectedQuery };

sample({
  clock: navigate,
  fn: ({ id, name }) => ({ id, name }),
  target: $bread,
});

sample({
  clock: navigate,
  fn: ({ selected }) => selected || null,
  target: $selected,
});

sample({
  clock: setDataset,
  fn: ({ id, name }) => ({ id, name, type: 'dataset' as const }),
  target: $selected,
});

sample({
  clock: setExperiment,
  fn: ({ id, name }) => ({ id, name, type: 'experiment' as const }),
  target: $selected,
});

sample({
  clock: $data,
  filter: (data: any) => data !== null,
  fn: (data: any) => ({
    id: data.id,
    name: data.name,
  }),
  target: $bread,
});

// Обновляем $selected при загрузке данных experiment
sample({
  clock: $experimentData,
  filter: (data: any) => data !== null,
  fn: (data: any) => ({
    type: 'experiment' as const,
    id: data.id,
    name: data.name,
  }),
  target: $selected,
});

// Обновляем $selected при загрузке данных dataset
sample({
  clock: $datasetData,
  filter: (data: any) => data !== null,
  fn: (data: any) => ({
    type: 'dataset' as const,
    id: data.id,
    name: data.name,
  }),
  target: $selected,
});

// Сбрасываем $selected когда $selectedFromState становится null
sample({
  clock: $selectedQuery,
  filter: (selected) => selected === null,
  fn: () => null,
  target: $selected,
});

sample({
  clock: navigate,
  fn: ({ id, tab, selected, replace }) => {
    const item = selected
      ? `${selected.type === 'experiment' ? 'pipe' : 'ds'}-${selected.id}`
      : undefined;
    return {
      replace: replace ?? false,
      params: {},
      query: {
        id,
        ...(tab && { tab }),
        ...(selected && selected.dsTab && { dsTab: selected.dsTab }),
        ...(selected && selected.pipeTab && { pipeTab: selected.pipeTab }),
        ...(item && { selected: item }),
      },
    };
  },
  target: SFModule.routes.project.navigate,
});
