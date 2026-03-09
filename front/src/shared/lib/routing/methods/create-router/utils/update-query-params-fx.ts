import { createEffect } from 'effector';
import { History } from 'history';
import { isEqual } from 'lodash-es';

import {
  createQueryParamsString,
  getLocationQueryParams,
  mergeQueryParams,
  setQueryParamsToPath,
} from '../../../lib';

export interface UpdateQueryParamsFxPayload {
  history: History;
  queryUpdate: AnyObject;
  method?: 'push' | 'replace';
}

export const updateQueryParamsFx = createEffect(
  ({ queryUpdate, history, method }: UpdateQueryParamsFxPayload) => {
    const currentQuery = getLocationQueryParams();

    const targetQueryString = createQueryParamsString(
      mergeQueryParams(currentQuery, queryUpdate),
    );

    if (!history) return;

    if (isEqual(createQueryParamsString(currentQuery), targetQueryString))
      return;

    if (method === 'push') {
      history.push(
        setQueryParamsToPath(history.location.pathname, targetQueryString),
      );
    } else {
      history.replace(
        setQueryParamsToPath(history.location.pathname, targetQueryString),
      );
    }
  },
);
