import { sample } from 'effector';

import { ControlPlaneModule } from '@/modules/control-plane/config';
import { ExperimentRenameModel } from '@/modules/control-plane/features/experiment/rename';
import { ExperimentUpdateModel } from '@/modules/control-plane/features/experiment/update';

import { experiment } from '../../state';

// При успешном обновлении обновляем experiment в списке
sample({
  clock: ExperimentUpdateModel.success,
  filter: ControlPlaneModule.routes.project.view.$mounted,
  fn: ({ result }) => result,
  target: experiment.list.update,
});

// При успешном переименовании обновляем experiment в списке
sample({
  clock: ExperimentRenameModel.success,
  filter: ControlPlaneModule.routes.project.view.$mounted,
  fn: ({ result }) => result,
  target: experiment.list.update,
});

// При успешном переименовании обновляем активный experiment если id совпадают
sample({
  clock: ExperimentRenameModel.success,
  source: experiment.active.$data,
  filter: (activeExperiment, { result }) =>
    ControlPlaneModule.routes.project.view.$mounted && activeExperiment?.id === result.id,
  fn: (_, { result }) => result,
  target: experiment.active.updateData,
});

// При успешном обновлении обновляем активный experiment
sample({
  clock: ExperimentUpdateModel.success,
  filter: ControlPlaneModule.routes.project.view.$mounted,
  fn: ({ result }) => {
    return result;
  },
  target: experiment.active.updateData,
});
