import { createEvent, sample } from 'effector';

import { ParamType } from '@/modules/control-plane/shared/components/forms';
import { createCachedStore } from '@/shared/lib/effector/cached-store';

// Доступные цвета для label (из Gravity UI)
export type LabelColor =
  | 'normal'
  | 'info'
  | 'success'
  | 'warning'
  | 'danger'
  | 'utility'
  | 'unknown'
  | 'clear';

// Ширина формы
export type FormWidth = 'full' | 'fixed';

// Тема цветов
export type ColorTheme = 'monochrome' | 'multicolor';

// Типы параметров, которые отображаются в форме (без struct)
export type VisibleParamType = Exclude<ParamType, 'struct'>;

// Настройки цветов для каждого типа параметра
export type ParamTypeColors = Record<VisibleParamType, LabelColor>;

// Версия настроек (увеличивать при изменении структуры)
const SETTINGS_VERSION = 4;

// Настройки формы
export interface FormParamsSettings {
  // Версия настроек
  version: number;
  // Ширина формы (full или fixed)
  width: FormWidth;
  // Отображать фон label
  showBackground: boolean;
  // Тема цветов (одноцветная или многоцветная)
  colorTheme: ColorTheme;
  // Цвет для одноцветной темы
  monochromeColor: LabelColor;
  // Цвета для каждого типа параметра (для многоцветной темы)
  multicolorSettings: ParamTypeColors;
}

// Значения по умолчанию для многоцветной темы
const DEFAULT_MULTICOLOR_SETTINGS: ParamTypeColors = {
  integer: 'info',
  double: 'utility',
  string: 'success',
  boolean: 'warning',
  array: 'danger',
  kv: 'unknown',
  custom: 'clear',
};

// Начальное состояние
const DEFAULT_SETTINGS: FormParamsSettings = {
  version: SETTINGS_VERSION,
  width: 'full',
  showBackground: true,
  colorTheme: 'monochrome',
  monochromeColor: 'info',
  multicolorSettings: DEFAULT_MULTICOLOR_SETTINGS,
};

// Ключ для localStorage
const STORAGE_KEY = 'form-params-settings';

/**
 * Проверяет версию настроек и выполняет миграцию при необходимости
 * @param stored - настройки из localStorage
 * @returns валидные настройки или DEFAULT_SETTINGS
 */
const validateAndMigrateSettings = (stored: any): FormParamsSettings => {
  // Если нет данных или нет версии - используем дефолтные настройки
  if (!stored || typeof stored !== 'object' || !stored.version) {
    console.info('[FormParamsSettings] No version found, using defaults');
    return DEFAULT_SETTINGS;
  }

  // Если версия не совпадает - используем дефолтные настройки
  if (stored.version !== SETTINGS_VERSION) {
    console.info(
      `[FormParamsSettings] Version mismatch (stored: ${stored.version}, current: ${SETTINGS_VERSION}), using defaults`,
    );
    return DEFAULT_SETTINGS;
  }

  // Проверяем наличие всех обязательных полей
  const requiredFields: (keyof FormParamsSettings)[] = [
    'version',
    'width',
    'showBackground',
    'colorTheme',
    'monochromeColor',
    'multicolorSettings',
  ];

  const hasAllFields = requiredFields.every((field) => field in stored);

  if (!hasAllFields) {
    console.warn(
      '[FormParamsSettings] Missing required fields, using defaults',
    );
    return DEFAULT_SETTINGS;
  }

  // Валидация значений
  if (stored.width !== 'full' && stored.width !== 'fixed') {
    console.warn('[FormParamsSettings] Invalid width value, using defaults');
    return DEFAULT_SETTINGS;
  }

  if (
    stored.colorTheme !== 'monochrome' &&
    stored.colorTheme !== 'multicolor'
  ) {
    console.warn(
      '[FormParamsSettings] Invalid colorTheme value, using defaults',
    );
    return DEFAULT_SETTINGS;
  }

  // Валидация цветов
  const validColors: LabelColor[] = [
    'normal',
    'info',
    'success',
    'warning',
    'danger',
    'utility',
    'unknown',
    'clear',
  ];

  if (!validColors.includes(stored.monochromeColor)) {
    console.warn(
      '[FormParamsSettings] Invalid monochromeColor value, using defaults',
    );
    return DEFAULT_SETTINGS;
  }

  // Проверяем цвета для каждого типа параметра
  const paramTypes: VisibleParamType[] = [
    'integer',
    'double',
    'string',
    'boolean',
    'array',
    'kv',
  ];
  for (const paramType of paramTypes) {
    if (
      !stored.multicolorSettings[paramType] ||
      !validColors.includes(stored.multicolorSettings[paramType])
    ) {
      console.warn(
        `[FormParamsSettings] Invalid color for ${paramType}, using defaults`,
      );
      return DEFAULT_SETTINGS;
    }
  }

  // Все проверки пройдены - возвращаем загруженные настройки
  return stored as FormParamsSettings;
};

// События
const reset = createEvent();
const setWidth = createEvent<FormWidth>();
const setShowBackground = createEvent<boolean>();
const setColorTheme = createEvent<ColorTheme>();
const setMonochromeColor = createEvent<LabelColor>();
const setMulticolorSettings = createEvent<ParamTypeColors>();
const setParamTypeColor = createEvent<{
  paramType: VisibleParamType;
  color: LabelColor;
}>();
const loadSettings = createEvent<Partial<FormParamsSettings>>();

/**
 * Store с автоматическим сохранением в localStorage
 *
 * При создании:
 * - Проверяет наличие сохраненных настроек в localStorage
 * - Валидирует версию и структуру данных
 * - Если версия не совпадает или данные невалидны - использует DEFAULT_SETTINGS
 * - Если все проверки пройдены - загружает сохраненные настройки
 *
 * При изменении:
 * - Автоматически сохраняет все изменения в localStorage
 */

// Загружаем и валидируем начальное значение
const getInitialSettings = (): FormParamsSettings => {
  try {
    const key = `$store_${STORAGE_KEY}`;
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      return validateAndMigrateSettings(parsed);
    }
  } catch (error) {
    console.error(
      '[FormParamsSettings] Failed to load from localStorage:',
      error,
    );
  }
  return DEFAULT_SETTINGS;
};

const $settings = createCachedStore<FormParamsSettings>(getInitialSettings(), {
  key: STORAGE_KEY,
  type: 'local',
});

// Внутреннее событие для обновления store
const updateSettings = createEvent<FormParamsSettings>();

// Подключаем событие к store
$settings.on(updateSettings, (_, newSettings) => newSettings);

// Обработка сброса настроек
sample({
  clock: reset,
  fn: () => DEFAULT_SETTINGS,
  target: updateSettings,
});

// Обновление ширины
sample({
  clock: setWidth,
  source: $settings,
  fn: (settings: FormParamsSettings, width: FormWidth) => ({
    ...settings,
    width,
    version: SETTINGS_VERSION,
  }),
  target: updateSettings,
});

// Обновление отображения фона
sample({
  clock: setShowBackground,
  source: $settings,
  fn: (settings: FormParamsSettings, showBackground: boolean) => ({
    ...settings,
    showBackground,
    version: SETTINGS_VERSION,
  }),
  target: updateSettings,
});

// Обновление темы цветов
sample({
  clock: setColorTheme,
  source: $settings,
  fn: (settings: FormParamsSettings, colorTheme: ColorTheme) => ({
    ...settings,
    colorTheme,
    version: SETTINGS_VERSION,
  }),
  target: updateSettings,
});

// Обновление цвета для одноцветной темы
sample({
  clock: setMonochromeColor,
  source: $settings,
  fn: (settings: FormParamsSettings, monochromeColor: LabelColor) => ({
    ...settings,
    monochromeColor,
    version: SETTINGS_VERSION,
  }),
  target: updateSettings,
});

// Обновление всех цветов для многоцветной темы
sample({
  clock: setMulticolorSettings,
  source: $settings,
  fn: (settings: FormParamsSettings, multicolorSettings: ParamTypeColors) => ({
    ...settings,
    multicolorSettings,
    version: SETTINGS_VERSION,
  }),
  target: updateSettings,
});

// Обновление цвета для конкретного типа параметра
sample({
  clock: setParamTypeColor,
  source: $settings,
  fn: (
    settings: FormParamsSettings,
    { paramType, color }: { paramType: VisibleParamType; color: LabelColor },
  ) => ({
    ...settings,
    multicolorSettings: {
      ...settings.multicolorSettings,
      [paramType]: color,
    },
    version: SETTINGS_VERSION,
  }),
  target: updateSettings,
});

// Загрузка настроек
sample({
  clock: loadSettings,
  source: $settings,
  fn: (
    currentSettings: FormParamsSettings,
    newSettings: Partial<FormParamsSettings>,
  ) => ({
    ...currentSettings,
    ...newSettings,
    version: SETTINGS_VERSION,
  }),
  target: updateSettings,
});

// Вспомогательная функция для получения цвета параметра
export const getParamColor = (
  settings: FormParamsSettings,
  paramType: ParamType,
): LabelColor => {
  if (settings.colorTheme === 'monochrome') {
    return settings.monochromeColor;
  }
  // Struct не отображается в форме, используем дефолтный цвет
  if (paramType === 'struct') {
    return settings.monochromeColor;
  }
  return (
    settings.multicolorSettings[paramType] ??
    DEFAULT_MULTICOLOR_SETTINGS[paramType]
  );
};

export const formParamsSettingsModel = {
  // Store
  $settings,

  // Events
  reset,
  setWidth,
  setShowBackground,
  setColorTheme,
  setMonochromeColor,
  setMulticolorSettings,
  setParamTypeColor,
  loadSettings,

  // Utils
  getParamColor,
  DEFAULT_SETTINGS,
  DEFAULT_MULTICOLOR_SETTINGS,
};
