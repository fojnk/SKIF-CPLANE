import { sample } from 'effector';

import { ShowVersionModel } from '@/modules/control-plane/features/dataset/version/show';

import { dataSource, dataSourceVersions } from '../../state';

sample({
  clock: ShowVersionModel.versionRestored,
  target: [dataSourceVersions.list.reload, dataSourceVersions.current.reload],
});

sample({
  clock: ShowVersionModel.versionRestored,
  filter: ({ params }) => Boolean(params?.dataset_id),
  fn: ({ params }) => params.dataset_id,
  target: dataSource.active.load,
});
