import { Query } from '@farfetched/core';
import { EventCallable, Store } from 'effector';

import { PaginationData } from '@/shared/lib/complex/paginated-table';
import { ValueModelUnitShape } from '@/shared/lib/effector/value-model';

export interface DataListData<T, Meta = unknown> {
  page: number;
  size: number;
  total: number;
  items: T[];
  meta?: Meta;
}

export interface ListDataModelCfg<Input, Item, Params, Meta = unknown> {
  enabled?: Store<boolean>;
  defaults?: { size?: number };
  params?: Store<Params>;
  updateDelay?: number;
  handler: (
    data: HandlerPayload<Input, Params>,
  ) => Promise<DataListData<Item, Meta>>;

  name?: string;
}

export type HandlerPayload<Input, Params> = PaginationData & {
  search: string;
  params: Params;
  input: Input;
};

export interface ListDataModel<Input, Item, Meta = unknown> {
  $loading: Store<boolean>;
  $allLoaded: Store<boolean>;
  $total: Store<number>;
  $items: Store<Item[]>;
  $meta: Store<Meta | null>;
  $search: Store<string>;

  loadMore: EventCallable<void>;
  reset: EventCallable<void>;
  refresh: EventCallable<void>;
  setSearch: EventCallable<string>;

  query: Query<Input, DataListData<Item>, unknown>;

  '@@unitShape': ValueModelUnitShape<
    Omit<ListDataModel<Input, Item, Meta>, 'query'>
  >;
}
