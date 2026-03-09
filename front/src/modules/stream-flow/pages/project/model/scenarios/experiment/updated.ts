import { sample } from 'effector';

import { SFModule } from '@/modules/stream-flow/config';
import { ExperimentRenameModel } from '@/modules/stream-flow/features/experiment/rename';
import { ExperimentUpdateModel } from '@/modules/stream-flow/features/experiment/update';

import { experiment } from '../../state';

// При успешном обновлении обновляем experiment в списке
sample({
  clock: ExperimentUpdateModel.success,
  filter: SFModule.routes.project.view.$mounted,
  fn: ({ result }) => result,
  target: experiment.list.update,
});

// При успешном переименовании обновляем experiment в списке
sample({
  clock: ExperimentRenameModel.success,
  filter: SFModule.routes.project.view.$mounted,
  fn: ({ result }) => result,
  target: experiment.list.update,
});

// При успешном переименовании обновляем активный experiment если id совпадают
sample({
  clock: ExperimentRenameModel.success,
  source: experiment.active.$data,
  filter: (activeExperiment, { result }) =>
    SFModule.routes.project.view.$mounted && activeExperiment?.id === result.id,
  fn: (_, { result }) => result,
  target: experiment.active.updateData,
});

// При успешном обновлении обновляем активный experiment
sample({
  clock: ExperimentUpdateModel.success,
  filter: SFModule.routes.project.view.$mounted,
  fn: ({ result }) => {
    return result;
  },
  target: experiment.active.updateData,
});
