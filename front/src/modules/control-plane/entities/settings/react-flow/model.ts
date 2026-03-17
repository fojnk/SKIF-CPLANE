import { createEvent, sample } from 'effector';

import { createCachedStore } from '@/shared/lib/effector/cached-store';

// Версия настроек (увеличивать при изменении структуры)
const SETTINGS_VERSION = 1;

// Настройки React Flow
export interface ReactFlowSettings {
  // Версия настроек
  version: number;
  // Отображать точки на фоне
  showDotsBackground: boolean;
}

// Начальное состояние
const DEFAULT_SETTINGS: ReactFlowSettings = {
  version: SETTINGS_VERSION,
  showDotsBackground: true,
};

// Ключ для localStorage
const STORAGE_KEY = 'react-flow-settings';

/**
 * Проверяет версию настроек и выполняет миграцию при необходимости
 * @param stored - настройки из localStorage
 * @returns валидные настройки или DEFAULT_SETTINGS
 */
const validateAndMigrateSettings = (stored: unknown): ReactFlowSettings => {
  // Если нет данных или нет версии - используем дефолтные настройки
  if (
    !stored ||
    typeof stored !== 'object' ||
    !('version' in stored) ||
    typeof (stored as Record<string, unknown>).version !== 'number'
  ) {
    console.info('[ReactFlowSettings] No version found, using defaults');
    return DEFAULT_SETTINGS;
  }

  const storedSettings = stored as Record<string, unknown>;

  // Если версия не совпадает - используем дефолтные настройки
  if (storedSettings.version !== SETTINGS_VERSION) {
    console.info(
      `[ReactFlowSettings] Version mismatch (stored: ${storedSettings.version}, current: ${SETTINGS_VERSION}), using defaults`,
    );
    return DEFAULT_SETTINGS;
  }

  // Проверяем наличие всех обязательных полей
  if (typeof storedSettings.showDotsBackground !== 'boolean') {
    console.warn(
      '[ReactFlowSettings] Invalid showDotsBackground value, using defaults',
    );
    return DEFAULT_SETTINGS;
  }

  // Все проверки пройдены - возвращаем загруженные настройки
  return stored as ReactFlowSettings;
};

// События
const reset = createEvent();
const setShowDotsBackground = createEvent<boolean>();
const loadSettings = createEvent<Partial<ReactFlowSettings>>();

// Загружаем и валидируем начальное значение
const getInitialSettings = (): ReactFlowSettings => {
  try {
    const key = `$store_${STORAGE_KEY}`;
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      return validateAndMigrateSettings(parsed);
    }
  } catch (error) {
    console.error(
      '[ReactFlowSettings] Failed to load from localStorage:',
      error,
    );
  }
  return DEFAULT_SETTINGS;
};

const $settings = createCachedStore<ReactFlowSettings>(getInitialSettings(), {
  key: STORAGE_KEY,
  type: 'local',
});

// Внутреннее событие для обновления store
const updateSettings = createEvent<ReactFlowSettings>();

// Подключаем событие к store
$settings.on(updateSettings, (_, newSettings) => newSettings);

// Обработка сброса настроек
sample({
  clock: reset,
  fn: () => DEFAULT_SETTINGS,
  target: updateSettings,
});

// Обновление отображения точек на фоне
sample({
  clock: setShowDotsBackground,
  source: $settings,
  fn: (settings: ReactFlowSettings, showDotsBackground: boolean) => ({
    ...settings,
    showDotsBackground,
    version: SETTINGS_VERSION,
  }),
  target: updateSettings,
});

// Загрузка настроек
sample({
  clock: loadSettings,
  source: $settings,
  fn: (
    currentSettings: ReactFlowSettings,
    newSettings: Partial<ReactFlowSettings>,
  ) => ({
    ...currentSettings,
    ...newSettings,
    version: SETTINGS_VERSION,
  }),
  target: updateSettings,
});

export const reactFlowSettingsModel = {
  // Store
  $settings,

  // Events
  reset,
  setShowDotsBackground,
  loadSettings,

  // Constants
  DEFAULT_SETTINGS,
};
