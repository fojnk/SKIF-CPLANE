import type { TableSettingsData } from '@gravity-ui/uikit';

export function loadTableSettings(
  storageKey: string,
  fallback: TableSettingsData,
): TableSettingsData {
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed as TableSettingsData;
    }
  } catch {
    return fallback;
  }
  return fallback;
}

export function saveTableSettings(
  storageKey: string,
  next: TableSettingsData,
): void {
  try {
    localStorage.setItem(storageKey, JSON.stringify(next));
  } catch {
    return;
  }
}
