import { createEvent, Event, sample, Store } from 'effector';
import { History } from 'history';
import { debounce } from 'patronum';

import { always } from '@/shared/lib/effector/always';

import {
  updateQueryParamsFx,
  UpdateQueryParamsFxPayload,
} from './update-query-params-fx';

export interface QueryGlobalSyncConfig<T> {
  history: Store<History>;
  source: Store<T> | Event<T>;
  fn?: (value: T) => AnyObject;
  delayUpdate?: number;
  method?: 'replace' | 'push';
  enabled?: Store<boolean>;
}

export const queryGlobalSync = <T>(config: QueryGlobalSyncConfig<T>) => {
  const $enabled = config.enabled || always(true);

  const queryUpdated = sample({
    clock: config.source as Store<T>,
    fn: (queryUpdate) =>
      config.fn
        ? (config.fn(queryUpdate) as AnyObject)
        : (queryUpdate as AnyObject),
  });

  const syncQuery = createEvent<AnyObject>();

  sample({
    clock: sample({
      clock: syncQuery,
      filter: $enabled,
    }),
    source: config.history,
    fn: (history, queryUpdate): UpdateQueryParamsFxPayload => ({
      method: config.method ?? 'replace',
      queryUpdate,
      history,
    }),
    target: updateQueryParamsFx,
  });

  if (config.delayUpdate == null) {
    sample({
      clock: queryUpdated,
      target: syncQuery,
    });
  } else {
    debounce({
      source: queryUpdated,
      timeout: config.delayUpdate!,
      target: syncQuery,
    });
  }
};
