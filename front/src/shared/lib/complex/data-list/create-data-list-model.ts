import { attachOperation, createQuery, keepFresh } from '@farfetched/core';
import { combine, createEvent, sample } from 'effector';
import { debounce, not } from 'patronum';

import { always } from '@/shared/lib/effector/always';
import { createValueModel } from '@/shared/lib/effector/value-model';

import { HandlerPayload, ListDataModel, ListDataModelCfg } from './types';

export const createDataListModel = <
  Input,
  Item,
  Params = unknown,
  Meta = unknown,
>(
  cfg: ListDataModelCfg<Input, Item, Params>,
): ListDataModel<Input, Item, Meta> => {
  const $params = cfg.params || always({} as Params);
  const $enabled = cfg.enabled || always(true);

  const config = {
    updateDelay: cfg.updateDelay ?? 250,
    size: cfg.defaults?.size ?? 10,
  };

  const rawQuery = createQuery({
    handler: cfg.handler,
    name: `data_list_query_${cfg.name}`,
    enabled: $enabled,
  });

  const search = createValueModel('');
  const page = createValueModel(1);
  const size = createValueModel(config.size);
  const loading = createValueModel(false, { type: 'switch' });

  const itemsByPages = createValueModel<Record<string, Item[]>>(
    {},
    { type: 'struct' },
  );

  const $loadedPages = itemsByPages.$value.map((itemsByPages) =>
    Object.keys(itemsByPages).map(Number),
  );

  const $items = combine(
    $loadedPages,
    itemsByPages.$value,
    (loadedPages, itemsByPages) => {
      return loadedPages.reduce<Item[]>((items, page) => {
        items.push(...(itemsByPages[page] || []));
        return items;
      }, []);
    },
  );

  const $payload = combine(
    page.$value,
    size.$value,
    search.$value,
    $params,
    (page, size, search, params) =>
      ({
        page,
        size,
        search,
        params,
      }) as unknown as HandlerPayload<Input, Params>,
  );

  const listQuery = attachOperation(rawQuery, {
    source: $payload,
    mapParams: (input: Input, payload): HandlerPayload<Input, Params> => ({
      ...payload,
      input,
    }),
  });

  const $total = listQuery.$data.map((data) => data?.total ?? 0);
  const $meta = listQuery.$data.map(
    (data) => (data?.meta as Maybe<Meta>) ?? null,
  );

  const $allLoaded = combine($items, $total, (items, total) => {
    if (!items.length) return false;

    return total === items.length;
  });

  const loadMore = createEvent();
  const refresh = createEvent();
  const reset = createEvent();

  sample({
    clock: listQuery.finished.success,
    fn: ({ result }) => ({ [result.page]: result.items }),
    target: itemsByPages.update,
  });

  sample({
    clock: $params,
    target: [itemsByPages.reset, page.reset, search.reset],
  });

  sample({
    clock: refresh,
    target: [loading.reset, itemsByPages.reset, page.reset, search.reset],
  });

  keepFresh(listQuery, {
    automatically: true,
    triggers: [debounce($payload, config.updateDelay), refresh],
  });

  sample({
    clock: [
      sample({
        clock: loadMore,
        filter: not($allLoaded),
      }),
      $payload,
    ],
    target: loading.turnOn,
  });

  sample({
    clock: listQuery.finished.finally,
    target: loading.turnOff,
  });

  sample({
    clock: loadMore,
    source: $loadedPages,
    filter: not($allLoaded),
    target: page.set.prepend((pages: number[]) => {
      const currentPage = pages[pages.length - 1] as Maybe<number>;

      if (!currentPage) {
        return 1;
      }

      return currentPage + 1;
    }),
  });

  sample({
    clock: reset,
    target: [
      page.reset,
      size.reset,
      search.reset,
      loading.reset,
      itemsByPages.reset,
      listQuery.reset,
    ],
  });

  return {
    $loading: loading.$on,
    $total,
    $items,
    $meta,
    $search: search.$value,
    $allLoaded,

    loadMore,
    refresh,
    reset,
    setSearch: search.set,

    query: listQuery,

    '@@unitShape': () => ({
      loading: loading.$on,
      total: $total,
      items: $items,
      meta: $meta,
      allLoaded: $allLoaded,
      search: search.$value,

      loadMore,
      refresh,
      reset,
      setSearch: search.set,
    }),
  };
};
