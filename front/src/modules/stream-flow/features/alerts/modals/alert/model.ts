import { createEvent, sample } from 'effector';

import {
  alertCreateSuccess,
  alertEditSuccess,
  alertRemoveSuccess,
} from '@/modules/stream-flow/entities/alerts/list_v2/model';
import { modalsModel } from '@/shared/ui/modals';

const modal = modalsModel.register({
  view: async () => (await import('./ui')).Modal,
});

export type AlertsModalSettings = {
  type: 'create' | 'edit';
  experiment_id: number;
  project_id?: string;
  alert_template_id?: string;
};

const start = createEvent<AlertsModalSettings>();

sample({
  clock: start,
  target: modal.open,
});

sample({
  clock: [alertCreateSuccess, alertRemoveSuccess, alertEditSuccess],
  target: modal.close,
});

export { start };
