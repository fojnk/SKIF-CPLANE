import { Dialog } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React from 'react';

import {
  NsRemovePayload,
  NsRemoveModel,
} from '@/modules/stream-flow/features/namespace/remove';
import { SfDialogFooter } from '@/modules/stream-flow/shared/ui';
import { ModalViewProps } from '@/shared/ui/modals';

export const Modal = ({
  open,
  onClose,
  payload,
  reset,
}: ModalViewProps<NsRemovePayload>) => {
  const [onSubmit, pending] = useUnit([
    NsRemoveModel.onSubmit,
    NsRemoveModel.$pending,
  ]);
  const handleSubmit = () => {
    onSubmit(payload.id);
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
