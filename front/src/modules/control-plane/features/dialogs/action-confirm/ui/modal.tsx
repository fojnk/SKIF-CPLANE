import { Dialog } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React from 'react';

import { ModalViewProps } from '@/shared/ui/modals';

import { confirmed } from '../model/model';
import type { ActionConfirmPayload } from '../types';

export const Modal = ({
  open,
  onClose,
  payload,
  reset,
}: ModalViewProps<ActionConfirmPayload>) => {
  const confirmAction = useUnit(confirmed);

  const isDeleteMode = payload.mode === 'delete';
  const title = isDeleteMode ? `Удалить ${payload.name}?` : payload.title;
  const actionText = isDeleteMode ? 'Удалить' : payload.actionText;

  const handleConfirm = () => {
    confirmAction(payload);
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
        caption={title}
        className={isDeleteMode ? 'danger-color' : undefined}
      />
      <Dialog.Footer
        preset="default"
        textButtonCancel="Отмена"
        propsButtonCancel={{
          view: 'outlined',
          type: 'button',
          size: 'l',
          onClick: onClose,
        }}
        textButtonApply={actionText}
        propsButtonApply={{
          view: isDeleteMode ? 'outlined-danger' : 'action',
          type: 'button',
          size: 'l',
          onClick: handleConfirm,
        }}
      />
    </Dialog>
  );
};
