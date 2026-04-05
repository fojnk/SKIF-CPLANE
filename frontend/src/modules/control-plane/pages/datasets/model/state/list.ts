import { createEvent, createStore, createEffect, sample } from 'effector';

import { catalogDsModel } from '@/modules/control-plane/entities/catalog/datasets';
import { DsCatalogFilter } from '@/modules/control-plane/shared/types';
import {
  saveDsCatalogFilter,
  loadDsCatalogFilter,
} from '@/modules/control-plane/shared/utils/filtersHelpers';

import * as query from './query';

const { load, $loading, $failed, reset, $data, $total, $error } =
  catalogDsModel.create();

const start = createEvent();
const reload = createEvent();
const setFilter = createEvent<DsCatalogFilter>();
const saveFilterFx = createEffect((filter: DsCatalogFilter) => {
  saveDsCatalogFilter(filter);

  // pagination
  query.limit.set(filter.limit.toString());
  query.offset.set(filter.offset.toString());

  // text filters
  query.search.set(filter.search ?? null);
  query.dsType.set(filter.type ?? null);
  query.orderBy.set(filter.order_by ?? null);

  // ids
  query.namespaceId.set(filter.namespace_id?.toString() ?? null);
  query.projectId.set(filter.project_id?.toString() ?? null);

  // flags
  query.isPublic.set(
    typeof filter.public === 'boolean' ? (filter.public ? '1' : '0') : null,
  );
});

const $filter = createStore<DsCatalogFilter | null>(null).reset(reset);

sample({
  clock: start,
  source: { values: query.$values },
  fn: ({ values }): DsCatalogFilter => {
    const hasPagination = values.limit != null && values.offset != null;
    if (!hasPagination) {
      const saved = loadDsCatalogFilter();
      return (
        saved ?? {
          limit: 100,
          offset: 0,
        }
      );
    }

    const u = <T>(v: T | null): T | undefined => (v == null ? undefined : v);

    return {
      limit: values.limit ?? 100,
      offset: values.offset ?? 0,
      search: u(values.search),
      type: u(values.type),
      order_by: u(values.orderBy),
      namespace_id: u(values.namespace_id),
      project_id: u(values.project_id),
      public: u(values.public),
    };
  },
  target: setFilter,
});

sample({
  clock: reload,
  source: $filter,
  fn: (f): DsCatalogFilter => f ?? { limit: 100, offset: 0 },
  target: load,
});

sample({
  clock: setFilter,
  target: [$filter, load, saveFilterFx],
});

export {
  start,
  $loading,
  load,
  $failed,
  $data,
  reset,
  $error,
  reload,
  $filter,
  setFilter,
  $total,
};
