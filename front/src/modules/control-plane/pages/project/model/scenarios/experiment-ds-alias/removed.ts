import { sample } from 'effector';

import { ExperimentRemoveDsModel } from '@/modules/control-plane/features/experiment/dataset/remove';

import { experiment } from '../../state';

// При успешном удалении удаляем experiment-ds из списка
sample({
  clock: ExperimentRemoveDsModel.success,
  fn: ({ params }) => params.link_id,
  target: experiment.ds.remove,
});
