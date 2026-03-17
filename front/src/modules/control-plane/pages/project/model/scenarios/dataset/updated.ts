import { sample } from 'effector';

import { ControlPlaneModule } from '@/modules/control-plane/config';
import { DsEditModel } from '@/modules/control-plane/features/dataset/edit';

import { dataSource, dataSourceVersions } from '../../state';

sample({
  clock: DsEditModel.success,
  filter: ControlPlaneModule.routes.project.view.$mounted,
  fn: ({ result }) => result.dataset!,
  target: dataSource.list.update,
});

sample({
  clock: DsEditModel.success,
  filter: ControlPlaneModule.routes.project.view.$mounted,
  fn: ({ result }) => result.dataset!,
  target: dataSource.active.updateData,
});

sample({
  clock: DsEditModel.success,
  filter: ControlPlaneModule.routes.project.view.$mounted,
  fn: ({ result }) => result.dataset!,
  target: dataSource.active.updateData,
});

sample({
  clock: DsEditModel.success,
  target: [dataSourceVersions.list.reload, dataSourceVersions.current.reload],
});
