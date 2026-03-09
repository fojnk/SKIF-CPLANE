import { sample } from 'effector';

import { ExperimentDeleteModel } from '@/modules/stream-flow/features/experiment/delete';

import { experiment, selected } from '../../state';

// При успешном удалении удаляем experiment из списка
sample({
  clock: ExperimentDeleteModel.success,
  fn: ({ params }) => params,
  target: experiment.list.remove,
});

// Сбрасываем selected если удалили выбранный experiment
sample({
  clock: ExperimentDeleteModel.success,
  source: selected.$selectedExperimentId,
  filter: (selectedId, { params }) => selectedId === params,
  fn: () => null,
  target: selected.setSelected,
});
