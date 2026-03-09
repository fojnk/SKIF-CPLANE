import { Dialog, Flex } from '@gravity-ui/uikit';
import React, { useMemo } from 'react';

import { ShowDiffPayload } from '@/modules/stream-flow/features/editor/show-diff';
import { VariableDiffEditor } from '@/modules/stream-flow/shared/components/diff-viewer';
import { ModalControls } from '@/modules/stream-flow/shared/ui/monaco';
import { formatData } from '@/modules/stream-flow/shared/utils/formatData';
import { ModalViewProps } from '@/shared/ui/modals';

export const Modal = ({
  open,
  onClose,
  payload,
  reset,
}: ModalViewProps<ShowDiffPayload>) => {
  // Форматируем JSON для отображения
  const formattedOriginalValue = useMemo(() => {
    if (!payload.originalConfig) return '';
    return formatData(payload.originalConfig);
  }, [payload.originalConfig]);

  const formattedModifiedValue = useMemo(() => {
    if (!payload.modifiedConfig) return '';
    return formatData(payload.modifiedConfig);
  }, [payload.modifiedConfig]);

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
      <Dialog.Header caption={`${payload.name}`} />
      <Dialog.Body>
        <Flex
          direction="column"
          style={{ width: '100%', height: '100%', minHeight: 0 }}
        >
          <VariableDiffEditor
            language="json"
            original={formattedOriginalValue}
            modified={formattedModifiedValue}
            showHeader
            message={{
              message: 'Comparing saved configuration with current changes',
              left: 'Saved',
              right: 'Current',
            }}
          />
        </Flex>
      </Dialog.Body>
      <Dialog.Footer>
        <Flex
          direction="row"
          alignItems="center"
          justifyContent="flex-end"
          gap={2}
          style={{ width: '100%' }}
        >
          <ModalControls showSideBySide showCollapseUnchanged />
        </Flex>
      </Dialog.Footer>
    </Dialog>
  );
};
