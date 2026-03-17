import { sample } from 'effector';

import { CloneModel } from '@/modules/control-plane/features/clone';

import { dataSource } from '../../state';

sample({
  clock: CloneModel.successDs,
  target: dataSource.list.refresh,
});
