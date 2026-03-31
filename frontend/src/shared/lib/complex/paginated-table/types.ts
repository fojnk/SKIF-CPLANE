import { Query } from '@farfetched/core';
import { EventCallable, Store } from 'effector';

import { ValueModelUnitShape } from '@/shared/lib/effector/value-model';

export interface PaginatedTableData<T, Meta = unknown> {
  page: number;
  size: number;
  total: number;
  items: T[];
  meta?: Meta;
}

export interface PaginatedTableConfig<Input, Item, Params, Meta = unknown> {
  /**
   * Базовые значения данных пагинации
   */
  defaults?: {
    size?: number;
    page?: number;
  };
  /**
   * Доп. данные для запроса
   */
  params?: Store<Params>;
  /**
   * Задержка обновления квери после изменения параметров или данных пагинации (по умолч. 250мс)
   */
  updateDelay?: number;
  /**
   * Синхронизация с квери параметрами данных пагинации
   */
  query?: { page: string; size: string };
  /**
   * Хендлер с помощью которого можно получить данные таблицы, используя входные параметры
   */
  handler: (
    data: HandlerPayload<Input, Params>,
  ) => Promise<PaginatedTableData<Item, Meta>>;

  name?: string;

  pageSizeOptions?: number[];
}

export type HandlerPayload<Input, Params> = PaginationData & {
  params: Params;
} & {
  input: Input;
};

export interface PaginationData {
  page: number;
  size: number;
}

export interface PaginatedTableModel<Input, Item, Meta = unknown> {
  $page: Store<number>;
  $size: Store<number>;
  $total: Store<number>;
  $items: Store<Item[]>;
  $meta: Store<Meta | null>;
  $empty: Store<boolean>;
  $pending: Store<boolean>;
  $pageSizeOptions: Store<number[]>;

  query: Query<Input, PaginatedTableData<Item>, unknown>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rawQuery: Query<any, any, any>;

  reset: EventCallable<void>;
  update: EventCallable<
    Partial<{
      page: number;
      size: number;
    }>
  >;

  defaults: { size: number };

  '@@unitShape': ValueModelUnitShape<
    Omit<
      PaginatedTableModel<Input, Item, Meta>,
      'query' | 'defaults' | 'rawQuery'
    >
  >;
}
