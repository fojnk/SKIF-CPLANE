import { createEffect, createEvent, createStore, sample } from 'effector';

import { catalogProjectModel } from '@/modules/control-plane/entities/catalog/projects';
import { ProjectCatalogFilter } from '@/modules/control-plane/shared/types';
import {
  loadProjectCatalogFilter,
  saveProjectCatalogFilter,
} from '@/modules/control-plane/shared/utils/filtersHelpers';

import * as query from './query';

const { load, $loading, $failed, reset, $data, $total, $error } =
  catalogProjectModel.create();

const start = createEvent();
const reload = createEvent();
const setFilter = createEvent<ProjectCatalogFilter>();
const saveFilterFx = createEffect((filter: ProjectCatalogFilter) => {
  saveProjectCatalogFilter(filter);

  // pagination
  query.limit.set(filter.limit.toString());
  query.offset.set(filter.offset.toString());

  // text filters
  query.search.set(filter.search ?? null);
  query.orderBy.set(filter.order_by ?? null);

  // ids
  query.namespaceId.set(filter.namespace_id?.toString() ?? null);
});

const $filter = createStore<ProjectCatalogFilter | null>(null).reset(reset);

sample({
  clock: start,
  source: { values: query.$values },
  fn: ({ values }): ProjectCatalogFilter => {
    const hasPagination = values.limit != null && values.offset != null;
    if (!hasPagination) {
      const saved = loadProjectCatalogFilter();
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
      order_by: u(values.orderBy),
      namespace_id: u(values.namespace_id),
    };
  },
  target: setFilter,
});

sample({
  clock: reload,
  source: $filter,
  fn: (f): ProjectCatalogFilter =>
    f ? { ...f, offset: 0 } : { limit: 100, offset: 0 },
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
