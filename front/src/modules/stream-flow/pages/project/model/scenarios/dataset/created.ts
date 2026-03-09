import { sample } from 'effector';

import { SFModule } from '@/modules/stream-flow/config';
import { DsCreateModel } from '@/modules/stream-flow/features/dataset/create';

import { dataSource, selected } from '../../state';

// При успешном создании добавляем dataset в начало списка
sample({
  clock: DsCreateModel.success,
  filter: SFModule.routes.project.view.$mounted,
  fn: ({ result }) => result,
  target: dataSource.list.add,
});

// При успешном создании выбираем из списка
sample({
  clock: DsCreateModel.success,
  filter: SFModule.routes.project.view.$mounted,
  fn: ({ result, params }) => {
    return { id: result.id!, name: params.name };
  },
  target: selected.setDataset,
});
