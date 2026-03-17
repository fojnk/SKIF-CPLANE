import { Button, Dialog, Flex } from '@gravity-ui/uikit';
import React from 'react';

import {
  MonacoDialogWrapper,
  SFMonaco,
} from '@/modules/control-plane/shared/ui/sf-monaco';
import { ModalViewProps } from '@/shared/ui/modals';

export const Modal = ({
  open,
  onClose,
  reset,
  payload,
}: ModalViewProps<string>) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      onTransitionOutComplete={reset}
      size="l"
      disableEscapeKeyDown
      disableOutsideClick
      className="variable-dialog"
    >
      <Dialog.Header caption="Errors" />
      <Dialog.Body>
        <MonacoDialogWrapper style={{ height: '100%' }}>
          <SFMonaco
            language="plaintext"
            value={payload}
            className="editor-page-monaco"
            options={{
              readOnly: true,
            }}
          />
        </MonacoDialogWrapper>
      </Dialog.Body>
      <Dialog.Footer>
        <Flex
          direction="row"
          justifyContent="flex-end"
          gap={2}
          style={{ width: '100%' }}
        >
          <Button size="l" view="outlined" onClick={onClose}>
            Close
          </Button>
        </Flex>
      </Dialog.Footer>
    </Dialog>
  );
};
