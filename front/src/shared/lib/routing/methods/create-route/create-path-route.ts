import { EmptyObject } from 'atomic-router';
import { createStore, sample, Store } from 'effector';
import { ComponentType, ReactNode } from 'react';

import { ViewModel } from '@/shared/lib/effector/view-model';
import { Router } from '@/shared/lib/routing';

import type { BaseRouteCfg, RouteInstance } from '../../types';
import { routeConfigHOC } from '../../ui';

export interface PathRouteInstance<Params extends AnyObject = EmptyObject>
  extends RouteInstance<Params> {
  path: string;
  $startsWithPath: Store<boolean>;
}

export interface PageRouteCfg extends BaseRouteCfg {
  type: 'page';
  path: string;
  layout?: ComponentType<{ children?: ReactNode }>;
}

export function createPathRoute<Params extends EmptyObject = EmptyObject>(
  cfg: PageRouteCfg,
  instance: RouteInstance<EmptyObject>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  vm: ViewModel<AnyObject>,
): PathRouteInstance<Params> {
  const route = instance as unknown as PathRouteInstance<Params>;

  route.__.type = 'path';
  route.__.path = cfg.path;

  route.__.layout = cfg.layout && routeConfigHOC(cfg.layout, cfg.config);
  route.__.Component = cfg.layout
    ? route.__.Component
    : routeConfigHOC(route.__.Component, cfg.config);
  //
  // route.$isOpened = vm.$mounted;

  route.path = cfg.path;

  const $startsWithPath = createStore(false);

  route.$startsWithPath = $startsWithPath;

  route.__.connect = (router: Router) => {
    sample({
      clock: router.$path.map((path) => path.startsWith(route.path)),
      target: $startsWithPath,
    });
  };

  return route;
}

export const isPathRoute = (
  instance: AnyObject,
): instance is PathRouteInstance<any> => instance?.__?.type === 'path';
