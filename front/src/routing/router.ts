import { sample } from 'effector';

import { ControlPlaneModule } from '@/modules/control-plane/config';
import {
  $capabilities,
  $user,
} from '@/modules/control-plane/entities/session/user/model/state';
import { hasCapability } from '@/modules/control-plane/shared/utils/authz';
import { createRouter } from '@/shared/lib/routing';

export const router = createRouter({
  base: '/',
  routes: Object.values(ControlPlaneModule.routes),
  privacy: (route, customRouter) => {
    sample({
      clock: route.$isOpened,
      source: $user,
      filter: (user, isOpened) => isOpened && !user,
      target: customRouter.push.prepend(() => ({
        method: 'replace' as const,
        path: ControlPlaneModule.routes.login.path,
        params: {},
        query: {},
      })),
    });

    sample({
      clock: route.$isOpened,
      source: $capabilities,
      filter: (capabilities, isOpened) => {
        if (!isOpened || !route.__.requiredCapability) {
          return false;
        }
        return !hasCapability(capabilities, route.__.requiredCapability);
      },
      target: customRouter.push.prepend(() => ({
        method: 'replace' as const,
        path: '/',
        params: {},
        query: {},
      })),
    });
  },
});

sample({
  clock: router.routeNotFound,
  target: router.push.prepend(() => ({
    method: 'replace',
    path: '/',
    params: {},
    query: {},
  })),
});
