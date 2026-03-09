import { ReactFlowSettings } from '@/modules/stream-flow/entities/settings/react-flow';

// Payload для открытия модального окна (пустой, так как настройки берутся из store)
export type ChangeReactFlowSettingsPayload = Record<string, never>;

// Форма настроек
export interface ReactFlowSettingsForm {
  showDotsBackground: boolean;
}

// Преобразование из ReactFlowSettings в форму
export const settingsToForm = (
  settings: ReactFlowSettings,
): ReactFlowSettingsForm => ({
  showDotsBackground: settings.showDotsBackground,
});

// Преобразование из формы в настройки (частичное обновление)
export const formToSettings = (
  form: ReactFlowSettingsForm,
): Partial<ReactFlowSettings> => ({
  showDotsBackground: form.showDotsBackground,
});
