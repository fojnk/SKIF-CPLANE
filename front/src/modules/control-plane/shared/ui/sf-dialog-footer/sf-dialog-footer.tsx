import { Dialog } from '@gravity-ui/uikit';
import React from 'react';

interface Props {
  pending?: boolean;
  textCancel?: string;
  textApply?: string;
  onClose: () => void;
  onSubmit: () => void;
  disabled: boolean;
  isRemove?: boolean;
}

export const SfDialogFooter = ({
  pending,
  textCancel = 'Отмена',
  textApply = 'Сохранить изменения',
  onClose,
  onSubmit,
  disabled,
  isRemove = false,
}: Props) => {
  return (
    <Dialog.Footer
      preset="success"
      loading={pending}
      textButtonCancel={textCancel}
      propsButtonCancel={{
        view: 'outlined',
        type: 'button',
        size: 'l',
        onClick: () => onClose(),
      }}
      textButtonApply={textApply}
      propsButtonApply={{
        view: isRemove ? 'outlined-danger' : 'action',
        type: 'button',
        size: 'l',
        onClick: onSubmit,
        disabled,
      }}
    />
  );
};
