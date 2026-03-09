import { getFromStorage, setToStorage } from '@/shared/lib/common/storage';

export const pageSizeOptions = [10, 15, 20, 50, 100] as const;
export const defaultSize = 10 as const;
export const logsPageSizeKey = 'logs-page-size' as const;
export const versionsPageSizeKey = 'versions-page-size' as const;
export const experimentVersionsPageSizeKey =
  'experiment-versions-page-size' as const;
export const datasetVersionsPageSizeKey = 'dataset-versions-page-size' as const;
export const variableVersionsPageSizeKey =
  'variable-versions-page-size' as const;
export const usersPageSizeKey = 'users-page-size' as const;
export const codeToggleKey = 'code-toggler' as const;
export const projectExperimentJobsPageSizeKey =
  'project-experiment-jobs-page-size-key' as const;

/**
 * Read initial page size from localStorage, or return fallback
 */
export function getInitialPageSize(storageKey: string): number {
  const stored = getFromStorage<number>({ type: 'local', key: storageKey });
  return typeof stored === 'number' && Number.isFinite(stored)
    ? stored
    : defaultSize;
}

/**
 * Persist page size to localStorage
 */
export function savePageSize(storageKey: string, pageSize: number): void {
  setToStorage({ type: 'local', key: storageKey, value: pageSize });
}

export function getLogsInitialPageSize(): number {
  return getInitialPageSize(logsPageSizeKey);
}

export function saveLogsPageSize(pageSize: number): void {
  savePageSize(logsPageSizeKey, pageSize);
}

export function getExperimentVersionsInitialPageSize(): number {
  return getInitialPageSize(experimentVersionsPageSizeKey);
}

export function saveExperimentVersionsPageSize(pageSize: number): void {
  savePageSize(experimentVersionsPageSizeKey, pageSize);
}

export function getDatasetVersionsInitialPageSize(): number {
  return getInitialPageSize(datasetVersionsPageSizeKey);
}

export function saveDatasetVersionsPageSize(pageSize: number): void {
  savePageSize(datasetVersionsPageSizeKey, pageSize);
}

export function getVariableVersionsInitialPageSize(): number {
  return getInitialPageSize(variableVersionsPageSizeKey);
}

export function saveVariableVersionsPageSize(pageSize: number): void {
  savePageSize(variableVersionsPageSizeKey, pageSize);
}

export function getUsersInitialPageSize(): number {
  return getInitialPageSize(usersPageSizeKey);
}

export function saveUsersPageSize(pageSize: number): void {
  savePageSize(usersPageSizeKey, pageSize);
}

export function getProjectExperimentJobsPageSize(): number {
  return getInitialPageSize(projectExperimentJobsPageSizeKey);
}

export function saveProjectExperimentJobsPageSize(pageSize: number): void {
  savePageSize(projectExperimentJobsPageSizeKey, pageSize);
}

export function getCodeToggleMode(): 'code' | 'form' {
  const stored = getFromStorage<'code' | 'form'>({
    type: 'local',
    key: codeToggleKey,
  });
  return stored === 'code' || stored === 'form' ? stored : 'code';
}

export function saveCodeToggleMode(mode: 'code' | 'form'): void {
  setToStorage({ type: 'local', key: codeToggleKey, value: mode });
}
