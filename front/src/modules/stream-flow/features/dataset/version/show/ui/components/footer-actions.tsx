import { Button, Flex } from '@gravity-ui/uikit';
import React from 'react';

import { ShowVersionMode } from '@/modules/stream-flow/features/dataset/version/show/types';

interface Props {
  mode: ShowVersionMode;
  isRestoring?: boolean;
  onClose: () => void;
  onBackToView: () => void;
  onRestore: () => void;
}

export const FooterActions = ({
  mode,
  isRestoring = false,
  onClose,
  onBackToView,
  onRestore,
}: Props) => {
  return (
    <Flex
      direction="row"
      justifyContent="flex-end"
      gap={2}
      style={{ width: '100%' }}
    >
      <Button size="l" onClick={onClose}>
        Close modal
      </Button>

      {(mode === 'compare' || mode === 'restore') && (
        <Button size="l" view="outlined" onClick={onBackToView}>
          Back to view
        </Button>
      )}

      {mode === 'restore' && (
        <Button
          size="l"
          view="action"
          onClick={onRestore}
          loading={isRestoring}
          disabled={isRestoring}
        >
          Restore version
        </Button>
      )}
    </Flex>
  );
};
