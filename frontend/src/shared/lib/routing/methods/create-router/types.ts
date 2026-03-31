import {
  createRouterControls,
  EmptyObject,
  HistoryPushParams,
  RouteObject,
  RouteQuery,
} from 'atomic-router';
import { Effect, Event, EventCallable, Store } from 'effector';
import { History } from 'history';
import { ComponentType } from 'react';

import {
  PageRouteCfg,
  PathRouteInstance,
} from '@/shared/lib/routing/methods/create-route/create-path-route';

import type { RouteInstance } from '../../types';

import type { QueryGlobalSyncConfig as QueryGlobalSyncPrivateConfig } from './utils/query-global-sync';
import type { UpdateQueryParamsFxPayload } from './utils/update-query-params-fx';

export type UpdateQueryPayload = {
  method?: UpdateQueryParamsFxPayload['method'];
  data: UpdateQueryParamsFxPayload['queryUpdate'];
};

export type QueryGlobalSyncConfig<T> = Omit<
  QueryGlobalSyncPrivateConfig<T>,
  'history' | 'currentQuery'
>;

export interface Router {
  $path: Store<string>;
  $activeRoutes: Store<RouteInstance<AnyObject>[]>;
  $history: Store<History>;
  setHistory: EventCallable<History>;
  $query: Store<RouteQuery>;
  back: EventCallable<void>;
  forward: EventCallable<void>;
  push: Effect<Omit<HistoryPushParams, 'history'>, HistoryPushParams, Error>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  routes: RouteObject<any>[];
  initialized: Event<{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    activeRoutes: RouteInstance<any>[];
    path: string;
    query: RouteQuery;
  }>;
  routeNotFound: Event<void>;
  controls: ReturnType<typeof createRouterControls>;

  baseQuery: AnyObject;

  updateQuery: EventCallable<UpdateQueryPayload>;
  queryGlobalSync: <T>(config: QueryGlobalSyncConfig<T>) => void;

  createRoute: <Params extends AnyObject = EmptyObject>(
    cfg: PageRouteCfg,
  ) => PathRouteInstance<Params>;

  RoutesView: ComponentType;
}
