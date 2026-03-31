import { Dialog } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React from 'react';

import {
  DsDeletePayload,
  DsDeleteModel,
} from '@/modules/control-plane/features/dataset/delete';
import { SfDialogFooter } from '@/modules/control-plane/shared/ui';
import { ModalViewProps } from '@/shared/ui/modals';

export const Modal = ({
  open,
  onClose,
  payload,
  reset,
}: ModalViewProps<DsDeletePayload>) => {
  const [deleteDataset, pending] = useUnit([
    DsDeleteModel.deleteDataset,
    DsDeleteModel.$pending,
  ]);
  const handleSubmit = () => {
    deleteDataset(payload.id);
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
