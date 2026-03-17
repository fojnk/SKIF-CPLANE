/* eslint-disable @typescript-eslint/no-explicit-any */
import { createRoute as createAtomicRoute, EmptyObject } from 'atomic-router';
import { attach, sample } from 'effector';
import { createEffect } from 'effector/compat';
import { not } from 'patronum';
import { ComponentType } from 'react';

import { generateId } from '@/shared/lib/common/id';
import { createFlagsListModel } from '@/shared/lib/effector/flags-list-model';
import { createViewModel } from '@/shared/lib/effector/view-model';
import { loadable } from '@/shared/lib/react/loadable';

import { RouteInstance } from '../../types';

import {
  createPathRoute,
  PageRouteCfg,
  PathRouteInstance,
} from './create-path-route';

export type AsyncViewLoader = () => Promise<ComponentType>;

export function createRoute<Params extends AnyObject = EmptyObject>(
  cfg: PageRouteCfg,
): PathRouteInstance<Params>;

export function createRoute(cfg: AnyObject): AnyObject {
  const blockers = createFlagsListModel();
  const instance = createAtomicRoute() as RouteInstance<EmptyObject>;
  const vm = createViewModel();

  instance.view = vm;

  if (!instance.__) {
    (instance as AnyObject).__ = {};
  }

  const $blocked = not(blockers.$empty);

  const origin = {
    open: instance.open,
    navigate: instance.navigate,
  };

  instance.navigate = attach({
    source: $blocked,
    mapParams: (payload: any, blocked: boolean) => ({ blocked, payload }),
    effect: createEffect<any, any>(
      ({ payload: { params, query, replace = false }, blocked }) => {
        if (blocked) {
          throw '';
        }

        return {
          params: params || {},
          query: query || {},
          replace,
        };
      },
    ),
  });

  instance.open = attach({
    effect: instance.navigate,
    mapParams: (params: any) => ({
      params: params || {},
      query: {},
    }),
  });

  sample({
    clock: instance.open.doneData,
    filter: not($blocked),
    target: origin.navigate,
  });

  sample({
    clock: instance.navigate.doneData,
    filter: not($blocked),
    target: origin.navigate,
  });

  instance.$blocked = $blocked;
  instance.__.id = generateId();
  instance.__.moduleLoaderFx = createEffect(cfg.view);
  instance.__.private = cfg.private;
  instance.__.requiredCapability = cfg.requiredCapability;
  instance.__.Component = loadable(
    async () => await instance.__.moduleLoaderFx(),
    cfg.loader || (() => null),
    vm.connect(() => null),
  );
  instance.preventRedirectIf = blockers.connect;

  // blockers.connect(instance.$isOpened);

  let route: RouteInstance<AnyObject> | undefined;

  if (cfg.type === 'page') {
    route = createPathRoute(
      cfg as PageRouteCfg,
      instance,
      vm,
    ) as unknown as RouteInstance<AnyObject>;
  }

  if (route) {
    createRoute.routes.push(route);
    return route;
  }

  throw new Error('unknown route configuration');
}

createRoute.routes = [] as RouteInstance<AnyObject>[];
