import { createEvent, sample } from 'effector';

import { modalsModel } from '@/shared/ui/modals';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ChangeLogViewerSettingsPayload {}

// Регистрация модального окна
const modal = modalsModel.register<ChangeLogViewerSettingsPayload>({
  view: async () => (await import('./ui')).ChangeLogViewerSettingsModal,
});

/**
 * События
 */
export const start = createEvent<ChangeLogViewerSettingsPayload>();

/**
 * Открытие модального окна
 */
sample({
  clock: start,
  target: modal.open,
});
