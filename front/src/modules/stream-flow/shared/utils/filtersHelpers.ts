import type {
  DsCatalogFilter,
  ProjectCatalogFilter,
} from '@/modules/stream-flow/shared/types';
import { getFromStorage, setToStorage } from '@/shared/lib/common/storage';

export const DS_CATALOG_FILTER_VERSION = 1 as const;
export const DS_CATALOG_FILTER_STORAGE_KEY = 'sf-ds-catalog-filter' as const;
export const PROJECT_CATALOG_FILTER_VERSION = 1 as const;
export const PROJECT_CATALOG_FILTER_STORAGE_KEY =
  'sf-project-catalog-filter' as const;

interface StoredFilter<T> {
  version: number;
  value: T;
}

export function saveDsCatalogFilter(filter: DsCatalogFilter): void {
  const payload: StoredFilter<DsCatalogFilter> = {
    version: DS_CATALOG_FILTER_VERSION,
    value: filter,
  };

  setToStorage({
    type: 'local',
    key: DS_CATALOG_FILTER_STORAGE_KEY,
    value: payload,
  });
}

export function loadDsCatalogFilter(): DsCatalogFilter | null {
  const stored = getFromStorage<StoredFilter<DsCatalogFilter>>({
    type: 'local',
    key: DS_CATALOG_FILTER_STORAGE_KEY,
  });

  if (!stored) return null;
  if (stored.version !== DS_CATALOG_FILTER_VERSION) return null;
  return stored.value;
}

export function saveProjectCatalogFilter(filter: ProjectCatalogFilter): void {
  const payload: StoredFilter<ProjectCatalogFilter> = {
    version: PROJECT_CATALOG_FILTER_VERSION,
    value: filter,
  };

  setToStorage({
    type: 'local',
    key: PROJECT_CATALOG_FILTER_STORAGE_KEY,
    value: payload,
  });
}

export function loadProjectCatalogFilter(): ProjectCatalogFilter | null {
  const stored = getFromStorage<StoredFilter<ProjectCatalogFilter>>({
    type: 'local',
    key: PROJECT_CATALOG_FILTER_STORAGE_KEY,
  });

  if (!stored) return null;
  if (stored.version !== PROJECT_CATALOG_FILTER_VERSION) return null;
  return stored.value;
}
