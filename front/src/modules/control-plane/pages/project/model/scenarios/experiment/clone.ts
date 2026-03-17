import { sample } from 'effector';

import { CloneModel } from '@/modules/control-plane/features/clone';

import { experiment } from '../../state';

sample({
  clock: CloneModel.successPipe,
  target: experiment.list.refresh,
});
