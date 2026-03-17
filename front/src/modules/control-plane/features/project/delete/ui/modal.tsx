import { Dialog } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React from 'react';

import {
  ProjectDeletePayload,
  ProjectDeleteModel,
} from '@/modules/control-plane/features/project/delete';
import { SfDialogFooter } from '@/modules/control-plane/shared/ui';
import { ModalViewProps } from '@/shared/ui/modals';

export const Modal = ({
  open,
  onClose,
  payload,
  reset,
}: ModalViewProps<ProjectDeletePayload>) => {
  const [deleteProject, pending] = useUnit([
    ProjectDeleteModel.deleteProject,
    ProjectDeleteModel.$pending,
  ]);
  const handleSubmit = () => {
    deleteProject(payload.id);
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
