import { useUnit } from 'effector-react';

import { Modal } from '../types';

export const ModalRenderer = ({
  id,
  view: View,
  close,
  $isOpened,
  $payload,
  reset,
  $existOnlyIf,
}: Modal) => {
  const [isOpened, payload, existOnlyIf] = useUnit([
    $isOpened,
    $payload,
    $existOnlyIf,
  ]);

  if (!payload || !existOnlyIf) return null;

  return (
    <View
      key={id}
      onClose={close}
      open={isOpened}
      payload={payload}
      reset={reset}
    />
  );
};
