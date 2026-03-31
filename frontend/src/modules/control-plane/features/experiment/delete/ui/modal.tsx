import { Dialog } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React from 'react';

import {
  ExperimentDeleteModel,
  ExperimentDeletePayload,
} from '@/modules/control-plane/features/experiment/delete';
import { SfDialogFooter } from '@/modules/control-plane/shared/ui';
import { ModalViewProps } from '@/shared/ui/modals';

export const Modal = ({
  open,
  onClose,
  payload,
  reset,
}: ModalViewProps<ExperimentDeletePayload>) => {
  const [onSubmit, pending] = useUnit([
    ExperimentDeleteModel.onSubmit,
    ExperimentDeleteModel.$pending,
  ]);
  const handleSubmit = () => {
    onSubmit(payload.experiment_id);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="s"
      disableOutsideClick
      className="sf-dialog"
      onTransitionOutComplete={reset}
    >
      <Dialog.Header
        caption={`Удалить ${payload.name}?`}
        className="danger-color"
      />
      <SfDialogFooter
        disabled={false}
        onClose={onClose}
        onSubmit={handleSubmit}
        pending={pending}
        textApply="Удалить"
        isRemove
      />
    </Dialog>
  );
};
