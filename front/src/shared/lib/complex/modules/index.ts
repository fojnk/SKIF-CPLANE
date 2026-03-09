import { attach, combine, createEffect, Effect, sample } from 'effector';
import { not, status } from 'patronum';

import { servicesModel } from '@/modules/stream-flow/entities/services';
import { pageViewMyTrackerFx } from '@/modules/stream-flow/features/app-tracker‎';
import { htmlElement } from '@/shared/config/dom';
import { createFlagsListModel } from '@/shared/lib/effector/flags-list-model';
import { syncWithHtmlAttribute } from '@/shared/lib/effector/sync-with-html-attribute';
import { createValueModel } from '@/shared/lib/effector/value-model';
import { ViewModel } from '@/shared/lib/effector/view-model';
import { when } from '@/shared/lib/effector/when';
import { RouteInstance } from '@/shared/lib/routing';
import { notifications } from '@/shared/ui/notifications';

import { AppModule } from './types';

export const activeModules = createValueModel<string>([], { type: 'list' });

syncWithHtmlAttribute({
  source: activeModules.$value,
  key: 'data-active-module',
  element: htmlElement,
  value: (activeModules) => activeModules[0],
});

export const registerModule = <R extends Record<string, RouteInstance<any>>>({
  routes,
  id,
  title,
  faviconHref,
  bootstrap,
}: {
  routes: R;
  id: string;
  title?: string;
  faviconHref?: string;
  bootstrap?: () => Promise<void>;
}): AppModule<R> => {
  const loadedFlag = createValueModel(false, { type: 'switch' });
  const mountedRoutes = createFlagsListModel();
  const $service = servicesModel.$services.map(
    (services) => services.find((service) => service.name === id) || null,
  );

  const $serviceAvailable = $service.map((service) => {
    return !service || !!service.available;
  });

  const $allModulesNotLoaded = combine(
    Object.values(routes).map((route) => {
      const view = route.view as ViewModel<any>;

      const routeLoaderFx = route.__.moduleLoaderFx as Effect<void, any>;

      const moduleLoaderFx = attach({
        effect: createEffect(async (serviceAvailable: boolean) => {
          //console.info('module loader fx body', serviceAvailable);
          if (!serviceAvailable) {
            throw new Error('Сервис недоступен');
          }
          await bootstrap?.();
          return await routeLoaderFx();
        }),
        source: $serviceAvailable,
        mapParams: (_, serviceAvailable) => serviceAvailable,
      });

      const loadStatus = status(moduleLoaderFx);

      route.__.moduleLoaderFx = moduleLoaderFx;

      mountedRoutes.connect(view.$mounted);

      sample({
        clock: [route.opened, route.__.moduleLoaderFx.fail],
        filter: not($serviceAvailable),
      }).watch(() => {
        notifications.push({
          type: 'danger',
          title: `Сервис "${id}" недоступен`,
          name: 'service-unavailable',
        });

        // Use direct navigation to avoid cyclic router/module initialization.
        window.location.replace('/');
      });

      sample({
        clock: moduleLoaderFx.done,
        target: loadedFlag.turnOn,
      });

      sample({
        clock: view.onUnmounted,
        target: loadStatus.reinit,
      });

      return loadStatus.map((status) => status === 'initial');
    }),
    (statuses) => {
      return statuses.every(Boolean);
    },
  );

  const $active = not(mountedRoutes.$empty);

  const setTitleFx = createEffect(() => {
    if (title) {
      document.title = title;
    }
  });

  const setFaviconFx = createEffect(() => {
    const elementIcon: HTMLLinkElement | null =
      document.querySelector("link[rel~='icon']");

    if (faviconHref && elementIcon) {
      elementIcon.href = faviconHref;
    }
  });

  sample({
    clock: $active,
    filter: Boolean,
    target: [setTitleFx, setFaviconFx],
  });

  $active.watch((active) => {
    if (active) {
      activeModules.add(id);
    } else {
      activeModules.delete(id);
    }
  });

  if (id === 'stream-flow') {
    sample({
      clock: $active,
      source: { active: $active },
      filter: ({ active }) => Boolean(active),
      target: pageViewMyTrackerFx,
    });
  }
  return {
    $loaded: loadedFlag.$on,
    $active,
    loaded: when(not($allModulesNotLoaded)),
    unloaded: when($allModulesNotLoaded),
    routes,
  };
};

export * from './types';
