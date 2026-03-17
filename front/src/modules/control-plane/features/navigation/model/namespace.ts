import { createEvent, createStore, sample } from 'effector';

import { ControlPlaneModule } from '@/modules/control-plane/config';
import {
  BreadParams,
  NamespaceNavigateParams,
} from '@/modules/control-plane/features/navigation';
import {
  $data,
  reset,
} from '@/modules/control-plane/pages/namespace/model/state/namespace';

export const navigate = createEvent<NamespaceNavigateParams>();
export const $bread = createStore<BreadParams | null>(null).reset(reset);

sample({
  clock: navigate,
  fn: ({ id, name }) => ({ id, name }),
  target: $bread,
});

sample({
  clock: $data,
  filter: (data: any) => data !== null,
  fn: (data: any) => ({
    id: data.id,
    name: data.name,
  }),
  target: $bread,
});

sample({
  clock: navigate,
  fn: ({ id, tab, replace }) => ({
    replace: replace ?? false,
    params: {},
    query: {
      id,
      ...(tab && { tab }),
    },
  }),
  target: ControlPlaneModule.routes.namespace.navigate,
});
