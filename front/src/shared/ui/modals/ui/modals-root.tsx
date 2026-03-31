import { useUnit } from 'effector-react';

import { modalsModel } from '@/shared/ui/modals';

import { ModalRenderer } from './modal-renderer';

export const ModalsRoot = () => {
  const modals = useUnit(modalsModel.modals.$value);

  return (
    <>
      {modals.map((modal) => (
        <ModalRenderer key={modal.id} {...modal} />
      ))}
    </>
  );
};
