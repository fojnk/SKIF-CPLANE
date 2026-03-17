import { createHistoryRouter, createRouterControls } from 'atomic-router';
import { createRoutesView } from 'atomic-router-react';
import { createEvent, EventPayload, sample } from 'effector';

import { RouteInstance } from '../../types';
import { isPathRoute } from '../create-route';

import type { QueryGlobalSyncConfig, Router } from './types';
import { queryGlobalSync } from './utils/query-global-sync';
import {
  updateQueryParamsFx,
  UpdateQueryParamsFxPayload,
} from './utils/update-query-params-fx';

export const createRouter = (config: {
  base: string;
  routes: RouteInstance<any>[];
  privacy?: (route: RouteInstance<AnyObject>, router: Router) => void;
}): Router => {
  const controls = createRouterControls();

  const pathRoutes = config.routes.filter(isPathRoute);

  const baseUrl = config.base.endsWith('/')
    ? config.base.substring(0, config.base.length - 1)
    : config.base;

  const router = createHistoryRouter({
    base: baseUrl,
    routes: pathRoutes.map((instance) => ({
      route: instance,
      path: instance.__.path,
    })),
    controls,
  });

  const RoutesView = createRoutesView({
    routes: pathRoutes.map((route) => ({
      route,
      view: route.__.Component,
      layout: route.__.layout,
    })),
  });

  const routeBasedUpdateQuery =
    createEvent<EventPayload<Router['updateQuery']>>();

  sample({
    clock: routeBasedUpdateQuery,
    source: router.$history,
    fn: (
      history,
      { data: queryUpdate, method },
    ): UpdateQueryParamsFxPayload => ({
      queryUpdate,
      history,
      method,
    }),
    target: updateQueryParamsFx,
  });

  const routeBasedQueryGlobalSync = <T>(payload: QueryGlobalSyncConfig<T>) =>
    queryGlobalSync<T>({
      ...payload,
      history: router.$history,
    });

  const customRouter = {
    ...router,
    controls,
    updateQuery: routeBasedUpdateQuery,
    queryGlobalSync: routeBasedQueryGlobalSync,
    RoutesView,
  } as unknown as Router;

  config.routes.forEach((route) => {
    route.__.connect?.(customRouter);
    if (config.privacy && route.__.private) {
      config.privacy(route, customRouter);
    }
  });

  return customRouter;
};
