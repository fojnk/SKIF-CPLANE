import { sample } from 'effector';

import { ExperimentAddDsModel } from '@/modules/control-plane/features/experiment/dataset/add';

import { experiment } from '../../state';

// При успешном создании добавляем experiment-ds в начало списка
sample({
  clock: ExperimentAddDsModel.success,
  fn: ({ result }) => result,
  target: experiment.ds.add,
});
