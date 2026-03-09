import { Dialog } from '@gravity-ui/uikit';

import { AlertsModalSettings } from '@/modules/stream-flow/features/alerts/modals/alert/model';
import { ModalCreateAlert } from '@/modules/stream-flow/features/alerts/modals/alert/ui/modal-create-alert';
import { ModalEditAlert } from '@/modules/stream-flow/features/alerts/modals/alert/ui/modal-edit-alert';
import { ModalViewProps } from '@/shared/ui/modals';

export const Modal = ({
  open,
  onClose,
  reset,
  payload,
}: ModalViewProps<AlertsModalSettings>) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      onTransitionOutComplete={reset}
      size="l"
      className="sf-dialog variable-dialog"
    >
      {payload.type === 'create' && (
        <ModalCreateAlert
          project_id={payload.project_id ?? ''}
          experiment_id={payload.experiment_id}
        />
      )}

      {payload.type === 'edit' && payload.alert_template_id && (
        <ModalEditAlert
          template_id={payload.alert_template_id}
          project_id={payload.project_id ?? ''}
          experiment_id={payload.experiment_id}
        />
      )}
    </Dialog>
  );
};
