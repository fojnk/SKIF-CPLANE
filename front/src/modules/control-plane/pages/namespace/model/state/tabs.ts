import { createEvent, createStore, sample } from 'effector';

import { ControlPlaneModule } from '@/modules/control-plane/config';
import { NamespaceTabType } from '@/modules/control-plane/shared/types';
import { router } from '@/routing/router';
import { querySyncModel } from '@/shared/lib/routing';

const tabQuery = querySyncModel<NamespaceTabType | null>({
  router,
  field: 'tab',
  method: 'replace',
  preset: 'string',
  enabled: ControlPlaneModule.routes.namespace.view.$mounted,
});

const $active = createStore<NamespaceTabType>('config');
const setActiveTab = createEvent<NamespaceTabType>();

sample({
  clock: setActiveTab,
  target: tabQuery.set,
});

sample({
  clock: setActiveTab,
  target: $active,
});

export { $active, setActiveTab, tabQuery };
