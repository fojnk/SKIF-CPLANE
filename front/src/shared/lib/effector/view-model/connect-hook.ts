import { useGate } from 'effector-react';

import { ViewModelInternal } from '@/shared/lib/effector/view-model';

export const connectHook = <Events extends AnyObject>(
  vm: ViewModelInternal<Events>,
) => {
  return () => useGate(vm.__.Gate);
};
