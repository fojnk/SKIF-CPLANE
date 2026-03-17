import { createEvent, sample } from 'effector';

import { reactFlowSettingsModel } from '@/modules/control-plane/entities/settings/react-flow';
import {
  ChangeReactFlowSettingsPayload,
  ReactFlowSettingsForm,
  formToSettings,
} from '@/modules/control-plane/features/settings/react-flow/change/types';
import { modalsModel } from '@/shared/ui/modals';

// Регистрация модального окна
const modal = modalsModel.register<ChangeReactFlowSettingsPayload>({
  view: async () => (await import('../ui')).Modal,
});

// События
const start = createEvent<ChangeReactFlowSettingsPayload>();
const submit = createEvent<ReactFlowSettingsForm>();
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
  target: reactFlowSettingsModel.loadSettings,
});

// Сброс к значениям по умолчанию
sample({
  clock: resetToDefaults,
  target: reactFlowSettingsModel.reset,
});

export { start, submit, resetToDefaults, modal };
