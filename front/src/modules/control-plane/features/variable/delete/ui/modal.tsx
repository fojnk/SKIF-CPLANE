import { Dialog } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React from 'react';

import {
  VariableDeletePayload,
  VariableDeleteModel,
} from '@/modules/control-plane/features/variable/delete';
import { SfDialogFooter } from '@/modules/control-plane/shared/ui';
import { ModalViewProps } from '@/shared/ui/modals';

export const Modal = ({
  open,
  onClose,
  payload,
  reset,
}: ModalViewProps<VariableDeletePayload>) => {
  const [deleteVariable, pending] = useUnit([
    VariableDeleteModel.deleteVariable,
    VariableDeleteModel.$pending,
  ]);

  const handleSubmit = () => {
    deleteVariable(payload.variable_id);
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
      <Dialog.Header caption="Удалить переменную?" className="danger-color" />
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
