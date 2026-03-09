import { sample } from 'effector';

import { SFModule } from '@/modules/stream-flow/config';
import { DsDeleteModel } from '@/modules/stream-flow/features/dataset/delete';

import { dataSource, selected } from '../../state';

// При успешном удалении удаляем dataset из списка
sample({
  clock: DsDeleteModel.success,
  filter: SFModule.routes.project.view.$mounted,
  fn: ({ params }) => params,
  target: dataSource.list.remove,
});

// Сбрасываем selected если удалили выбранный dataset
sample({
  clock: DsDeleteModel.success,
  source: {
    selectedId: selected.$selectedDatasetId,
    isMounted: SFModule.routes.project.view.$mounted,
  },
  filter: ({ selectedId, isMounted }, { params }) =>
    isMounted && selectedId === params,
  fn: () => null,
  target: selected.setSelected,
});
