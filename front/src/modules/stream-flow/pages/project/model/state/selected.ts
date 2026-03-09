import { createEvent, createStore, sample } from 'effector';

import { DataPair } from '@/modules/stream-flow/shared/types';

type EntityType = 'pipe' | 'ds';

const reset = createEvent();
const setSelected = createEvent<string | null>();
const setExperiment = createEvent<DataPair>();
const setDataset = createEvent<DataPair>();

const $selected = createStore<string | null>(null).reset(reset);

const parseSelected = (selected: string | null) => {
  if (!selected || !selected.includes('-')) {
    return { type: null, id: null };
  }

  const [type, idStr] = selected.split('-');
  const id = parseInt(idStr, 10);

  if (isNaN(id) || !['pipe', 'ds'].includes(type)) {
    return { type: null, id: null };
  }

  return { type: type as EntityType, id };
};

const formatSelected = (type: EntityType, id: number) => {
  return `${type}-${id}`;
};

sample({
  clock: setSelected,
  target: $selected,
});

sample({
  clock: setExperiment,
  fn: (data: DataPair) => {
    return formatSelected('pipe', data.id);
  },
  target: setSelected,
});

sample({
  clock: setDataset,
  fn: (data: DataPair) => {
    return formatSelected('ds', data.id);
  },
  target: setSelected,
});

sample({
  clock: setSelected,
  filter: (value) => value === null,
  target: reset,
});

const $selectedExperimentId = $selected.map((selected) => {
  const { type, id } = parseSelected(selected);
  return type === 'pipe' ? id : null;
});

const $selectedDatasetId = $selected.map((selected) => {
  const { type, id } = parseSelected(selected);
  return type === 'ds' ? id : null;
});

export {
  reset,
  $selected,
  setSelected,
  setExperiment,
  setDataset,
  $selectedExperimentId,
  $selectedDatasetId,
  parseSelected,
  formatSelected,
};
