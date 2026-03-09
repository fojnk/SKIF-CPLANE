import { Dialog } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React from 'react';

import {
  DsUpdateModel,
  DsUpdatePayload,
} from '@/modules/control-plane/features/dataset/update';
import { SfDialogFooter } from '@/modules/control-plane/shared/ui';
import { ModalViewProps } from '@/shared/ui/modals';

export const Modal = ({
  open,
  onClose,
  reset,
  payload,
}: ModalViewProps<DsUpdatePayload>) => {
  const [pending, updateDataset] = useUnit([
    DsUpdateModel.$pending,
    DsUpdateModel.updateDataset,
  ]);

  const handleSubmit = () => {
    updateDataset(payload);
  };

  return (
    <Dialog
      onTransitionOutComplete={reset}
      open={open}
      onClose={onClose}
      size="s"
      disableOutsideClick
      className="sf-dialog"
    >
      <Dialog.Header caption={`Save ${payload.name} ?`} />
      <Dialog.Body>
        After clicking «Save changes» migrations will be initiated. Continue?
      </Dialog.Body>
      <SfDialogFooter
        disabled={false}
        onClose={onClose}
        onSubmit={handleSubmit}
        pending={pending}
      />
    </Dialog>
  );
};
