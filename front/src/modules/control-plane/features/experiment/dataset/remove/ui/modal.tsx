import { Dialog } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React from 'react';

import {
  ExperimentRemoveDsPayload,
  ExperimentRemoveDsModel,
} from '@/modules/control-plane/features/experiment/dataset/remove';
import { SfDialogFooter } from '@/modules/control-plane/shared/ui/sf-dialog-footer';
import { ModalViewProps } from '@/shared/ui/modals';

export const Modal = ({
  open,
  onClose,
  payload,
  reset,
}: ModalViewProps<ExperimentRemoveDsPayload>) => {
  const [onSubmit, pending] = useUnit([
    ExperimentRemoveDsModel.onSubmit,
    ExperimentRemoveDsModel.$pending,
  ]);
  const handleSubmit = () => {
    onSubmit(payload);
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
        caption={`Удалить связь для ${payload.alias}?`}
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
