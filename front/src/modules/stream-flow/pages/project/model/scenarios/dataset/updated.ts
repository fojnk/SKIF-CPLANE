import { sample } from 'effector';

import { SFModule } from '@/modules/stream-flow/config';
import { DsEditModel } from '@/modules/stream-flow/features/dataset/edit';

import { dataSource, dataSourceVersions } from '../../state';

sample({
  clock: DsEditModel.success,
  filter: SFModule.routes.project.view.$mounted,
  fn: ({ result }) => result.dataset!,
  target: dataSource.list.update,
});

sample({
  clock: DsEditModel.success,
  filter: SFModule.routes.project.view.$mounted,
  fn: ({ result }) => result.dataset!,
  target: dataSource.active.updateData,
});

sample({
  clock: DsEditModel.success,
  filter: SFModule.routes.project.view.$mounted,
  fn: ({ result }) => result.dataset!,
  target: dataSource.active.updateData,
});

sample({
  clock: DsEditModel.success,
  target: [dataSourceVersions.list.reload, dataSourceVersions.current.reload],
});
