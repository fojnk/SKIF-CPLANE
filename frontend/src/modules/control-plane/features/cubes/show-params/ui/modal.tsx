import { Dialog, Flex } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React, { useMemo } from 'react';

import { monacoModel } from '@/modules/control-plane/entities/monaco';
import { ShowCubeParamsPayload } from '@/modules/control-plane/features/cubes/show-params/types';
import { ModalControls } from '@/modules/control-plane/shared/ui/monaco';
import {
  MonacoDialogWrapper,
  SFMonaco,
} from '@/modules/control-plane/shared/ui/sf-monaco';
import { formatData } from '@/modules/control-plane/shared/utils/formatData';
import { ModalViewProps } from '@/shared/ui/modals';

export const Modal = ({
  open,
  onClose,
  payload,
  reset,
}: ModalViewProps<ShowCubeParamsPayload>) => {
  const [fontSizeNumber] = useUnit([monacoModel.$fontSizeNumber]);

  const formattedValue = useMemo(() => {
    try {
      return formatData(payload.cubeParams);
    } catch {
      return payload.cubeParams;
    }
  }, [payload.cubeParams]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      onTransitionOutComplete={reset}
      size="l"
      disableEscapeKeyDown
      disableOutsideClick
      className="cube-params"
    >
      <Dialog.Header caption={`${payload.cubeName} params`} />
      <Dialog.Body>
        <Flex
          direction="column"
          style={{ height: '100%', position: 'relative' }}
        >
          <MonacoDialogWrapper style={{ position: 'absolute', inset: 0 }}>
            <SFMonaco
              language="json"
              value={formattedValue}
              className="monaco-viewer"
              options={{
                readOnly: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                fontSize: fontSizeNumber,
              }}
            />
          </MonacoDialogWrapper>
        </Flex>
      </Dialog.Body>
      <Dialog.Footer>
        <Flex
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          gap={2}
          style={{ width: '100%' }}
        >
          <ModalControls showSideBySide={false} showCollapseUnchanged={false} />
        </Flex>
      </Dialog.Footer>
    </Dialog>
  );
};
