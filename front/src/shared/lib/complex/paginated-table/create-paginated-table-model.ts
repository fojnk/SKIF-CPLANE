import { createQuery, keepFresh } from '@farfetched/core';
import {
  attach,
  combine,
  createEffect,
  createEvent,
  createStore,
  EventCallable,
  sample,
  StoreValue,
} from 'effector';
import { debounce, reshape } from 'patronum';

import { router } from '@/routing/router';
import { always } from '@/shared/lib/effector/always';
import { createValueModel } from '@/shared/lib/effector/value-model';
import { baseQueryParams } from '@/shared/lib/routing';

import {
  HandlerPayload,
  PaginatedTableConfig,
  PaginatedTableModel,
  PaginationData,
} from './types';

export const createPaginatedTableModel = <
  Input,
  Item,
  Params = unknown,
  Meta = unknown,
>(
  cfg: PaginatedTableConfig<Input, Item, Params>,
): PaginatedTableModel<Input, Item, Meta> => {
  const defaults = {
    page: cfg.defaults?.page ?? 1,
    size: cfg.defaults?.size ?? 10,
  };

  const $pageSizeOptions = createStore(
    cfg.pageSizeOptions ??
      Array(3)
        .fill(null)
        .map((_, i) => defaults.size * i + 20),
  );

  const pagination = createValueModel<PaginationData>(
    {
      page: (cfg.query && +baseQueryParams[cfg.query.page]!) || defaults.page,
      size: (cfg.query && +baseQueryParams[cfg.query.size]!) || defaults.size,
    },
    {
      type: 'struct',
    },
  );

  const $params = cfg.params || always({} as Params);
  const $handlerPayload = combine(
    pagination.$value,
    $params,
    (pagination, params) => ({
      ...pagination,
      params,
    }),
  );

  const rawFx = createEffect(cfg.handler);
  const attachedFx = attach({
    effect: rawFx,
    source: $handlerPayload,
    mapParams: (
      input: Input,
      payload: StoreValue<typeof $handlerPayload>,
    ): HandlerPayload<Input, Params> => ({
      ...payload,
      input,
    }),
  });

  const listQuery = createQuery({
    effect: attachedFx,
    name: `paginated_table_query_${cfg.name}`,
  }) as PaginatedTableModel<Input, Item, Meta>['query'];

  const update = pagination.update as EventCallable<Partial<PaginationData>>;
  const reset = createEvent();

  const refresh = createEvent<void>();

  keepFresh(listQuery, {
    automatically: true,
    triggers: [debounce($handlerPayload, cfg.updateDelay ?? 250), refresh],
  });

  sample({
    clock: reset,
    target: [listQuery.reset, pagination.reset],
  });

  if (cfg.query) {
    router.queryGlobalSync({
      source: pagination.$value,
      delayUpdate: 250,
      fn: ({ page, size }) => ({
        [cfg.query!.page]: page,
        [cfg.query!.size]: size,
      }),
    });
  }

  const paginationShape = reshape({
    source: pagination.$value,
    shape: {
      $page: (data) => data.page,
      $size: (data) => data.size,
    },
  });

  const listShape = reshape({
    source: listQuery.$data,
    shape: {
      $total: (data) => data?.total || 0,
      $items: (data) => data?.items || [],
      $meta: (data) => (data?.meta ?? null) as Meta | null,
      $empty: (data) => !data?.items.length,
    },
  });

  return {
    ...paginationShape,
    ...listShape,
    update,
    reset,
    $pending: listQuery.$pending,
    $pageSizeOptions,

    query: listQuery,
    rawQuery: listQuery,

    defaults: {
      size: defaults.size,
    },

    '@@unitShape': () => ({
      page: paginationShape.$page,
      size: paginationShape.$size,
      total: listShape.$total,
      pending: listQuery.$pending,
      items: listShape.$items,
      meta: listShape.$meta,
      empty: listShape.$empty,
      pageSizeOptions: $pageSizeOptions,
      refresh,
      update,
      reset,
    }),
  };
};
