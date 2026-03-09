import {
  FormParamsSettings,
  LabelColor,
  formParamsSettingsModel,
} from '@/modules/stream-flow/entities/settings/form-params';

// Payload для открытия модального окна (пустой, так как настройки берутся из store)
export type ChangeFormParamsSettingsPayload = Record<string, never>;

// Форма настроек
export interface FormParamsSettingsForm {
  width: 'full' | 'fixed';
  showBackground: boolean;
  colorTheme: 'monochrome' | 'multicolor';
  monochromeColor: LabelColor;
  // Для многоцветной темы
  integerColor: LabelColor;
  doubleColor: LabelColor;
  stringColor: LabelColor;
  booleanColor: LabelColor;
  arrayColor: LabelColor;
  kvColor: LabelColor;
  customColor: LabelColor;
}

// Преобразование из FormParamsSettings в форму
export const settingsToForm = (
  settings: FormParamsSettings,
): FormParamsSettingsForm => ({
  width: settings.width,
  showBackground: settings.showBackground,
  colorTheme: settings.colorTheme,
  monochromeColor: settings.monochromeColor,
  integerColor: settings.multicolorSettings.integer,
  doubleColor: settings.multicolorSettings.double,
  stringColor: settings.multicolorSettings.string,
  booleanColor: settings.multicolorSettings.boolean,
  arrayColor: settings.multicolorSettings.array,
  kvColor: settings.multicolorSettings.kv,
  customColor:
    settings.multicolorSettings.custom ??
    formParamsSettingsModel.DEFAULT_MULTICOLOR_SETTINGS.custom,
});

// Преобразование из формы в настройки (частичное обновление)
export const formToSettings = (
  form: FormParamsSettingsForm,
): Partial<FormParamsSettings> => ({
  width: form.width,
  showBackground: form.showBackground,
  colorTheme: form.colorTheme,
  monochromeColor: form.monochromeColor,
  multicolorSettings: {
    integer: form.integerColor,
    double: form.doubleColor,
    string: form.stringColor,
    boolean: form.booleanColor,
    array: form.arrayColor,
    kv: form.kvColor,
    custom: form.customColor,
  },
});
