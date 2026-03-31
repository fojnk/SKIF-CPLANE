import { sample } from 'effector';

import { ExperimentCreateModel } from '@/modules/control-plane/features/experiment/create';

import { experiment, selected } from '../../state';

// При успешном создании добавляем experiment в начало списка
sample({
  clock: ExperimentCreateModel.success,
  fn: ({ result }) => result,
  target: experiment.list.add,
});

// При успешном создании выбираем из списка
sample({
  clock: ExperimentCreateModel.success,
  fn: ({ result, params }) => {
    return { id: result.id!, name: params.name };
  },
  target: selected.setExperiment,
});
