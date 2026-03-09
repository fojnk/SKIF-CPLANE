import { NavigateParams } from 'atomic-router';
import { createEvent, sample } from 'effector';
import { isEqual } from 'lodash-es';

import { RouteInstance } from '@/shared/lib/routing';

export interface QueryChangePayload<Query extends AnyObject> {
  query: Partial<Query>;
  replace?: boolean;
}

/**
 * Событие для обновления квери параметров у роута с автоматическим мержем существующего квери
 */
export const createQueryChangeEvent = <Query extends AnyObject = AnyObject>(
  route: RouteInstance<any>,
  {
    filter = (a, b) => !isEqual(a, b),
    formatter,
  }: {
    filter?: (prev: Partial<Query>, next: Partial<Query>) => boolean;
    formatter?: (query: Partial<Query>) => AnyObject;
  } = {},
) => {
  const changeQuery = createEvent<QueryChangePayload<Query>>();

  sample({
    clock: sample({
      clock: changeQuery,
      source: [route.$query, route.$params] as const,
      fn: (
        [query, params],
        { query: queryUpdate, replace },
      ): NavigateParams<AnyObject> | null => {
        const nextQuery = {
          ...query,
          ...(formatter ? formatter(queryUpdate) : queryUpdate),
        };

        for (const key in nextQuery) {
          if (typeof nextQuery[key] === 'undefined') {
            delete nextQuery[key];
          }
        }

        if (!filter(query as Partial<Query>, nextQuery as Partial<Query>)) {
          return null;
        }

        return {
          query: nextQuery,
          params,
          replace: !!replace,
        };
      },
    }),
    filter: Boolean,
    target: route.navigate,
  });

  return changeQuery;
};
