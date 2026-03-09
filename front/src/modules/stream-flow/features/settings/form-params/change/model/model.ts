import { createEvent, sample } from 'effector';

import { formParamsSettingsModel } from '@/modules/stream-flow/entities/settings/form-params';
import {
  ChangeFormParamsSettingsPayload,
  FormParamsSettingsForm,
  formToSettings,
} from '@/modules/stream-flow/features/settings/form-params/change';
import { modalsModel } from '@/shared/ui/modals';

// Регистрация модального окна
const modal = modalsModel.register<ChangeFormParamsSettingsPayload>({
  view: async () => (await import('../ui/modal')).Modal,
});

// События
const start = createEvent<ChangeFormParamsSettingsPayload>();
const submit = createEvent<FormParamsSettingsForm>();
const resetToDefaults = createEvent();

// Открытие модального окна
sample({
  clock: start,
  target: modal.open,
});

// Сохранение настроек (на лету при изменении полей)
sample({
  clock: submit,
  fn: (form) => formToSettings(form),
  target: formParamsSettingsModel.loadSettings,
});

// Сброс к значениям по умолчанию
sample({
  clock: resetToDefaults,
  target: formParamsSettingsModel.reset,
});

export { start, submit, resetToDefaults, modal };
