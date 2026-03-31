import { sample } from 'effector';

import { ControlPlaneModule } from '@/modules/control-plane/config';
import { DsCreateModel } from '@/modules/control-plane/features/dataset/create';

import { dataSource, selected } from '../../state';

// При успешном создании добавляем dataset в начало списка
sample({
  clock: DsCreateModel.success,
  filter: ControlPlaneModule.routes.project.view.$mounted,
  fn: ({ result }) => result,
  target: dataSource.list.add,
});

// При успешном создании выбираем из списка
sample({
  clock: DsCreateModel.success,
  filter: ControlPlaneModule.routes.project.view.$mounted,
  fn: ({ result, params }) => {
    return { id: result.id!, name: params.name };
  },
  target: selected.setDataset,
});
