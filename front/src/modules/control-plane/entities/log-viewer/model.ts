import { createEffect, createEvent, createStore, sample } from 'effector';

/**
 * Опции размера шрифта
 */
export const FONT_SIZE_OPTIONS = [
  { value: '10px', content: '10px' },
  { value: '12px', content: '12px' },
  { value: '14px', content: '14px' },
  { value: '16px', content: '16px' },
  { value: '18px', content: '18px' },
  { value: '20px', content: '20px' },
] as const;

/**
 * Настройки LogViewer
 */
export interface LogViewerSettings {
  /** Всегда использовать темный фон */
  alwaysDarkTheme: boolean;
  /** Размер шрифта */
  fontSize: string;
}

/**
 * Дефолтные настройки LogViewer
 */
const defaultSettings: LogViewerSettings = {
  alwaysDarkTheme: false,
  fontSize: '14px',
};

/**
 * Ключ для хранения в localStorage
 */
const STORAGE_KEY = 'control_plane_log_viewer_settings';

/**
 * Загрузка настроек из localStorage
 */
const loadSettingsFx = createEffect<void, LogViewerSettings>(() => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...defaultSettings, ...parsed };
    }
  } catch (error) {
    console.error('Failed to load log viewer settings:', error);
  }
  return defaultSettings;
});

/**
 * Сохранение настроек в localStorage
 */
const saveSettingsFx = createEffect<LogViewerSettings, void>((settings) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save log viewer settings:', error);
  }
});

/**
 * События
 */
export const updateSettings = createEvent<Partial<LogViewerSettings>>();
export const resetSettings = createEvent();
export const loadSettings = createEvent();

/**
 * Store с настройками
 */
export const $settings = createStore<LogViewerSettings>(defaultSettings)
  .on(loadSettingsFx.doneData, (_, settings) => settings)
  .on(updateSettings, (state, updates) => ({ ...state, ...updates }))
  .on(resetSettings, () => defaultSettings);

/**
 * Автосохранение при изменении настроек
 */
sample({
  clock: updateSettings,
  source: $settings,
  target: saveSettingsFx,
});

/**
 * Автосохранение при сбросе настроек
 */
sample({
  clock: resetSettings,
  source: $settings,
  target: saveSettingsFx,
});

/**
 * Загрузка настроек при старте
 */
sample({
  clock: loadSettings,
  target: loadSettingsFx,
});

// Автоматическая загрузка при импорте модуля
loadSettings();
