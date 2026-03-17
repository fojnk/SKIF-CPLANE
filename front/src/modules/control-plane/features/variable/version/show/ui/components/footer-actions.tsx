import { Pencil } from '@gravity-ui/icons';
import { Button, Flex } from '@gravity-ui/uikit';
import React from 'react';

import { VariableVersionMode } from '@/modules/control-plane/features/variable/version/show/types';

interface Props {
  mode: VariableVersionMode;
  head: boolean;
  canEdit: boolean;
  hasChanges?: boolean;
  isUpdating?: boolean;
  isRestoring?: boolean;
  onClose: () => void;
  onBackToView: () => void;
  onCancelEdit: () => void;
  onEdit: () => void;
  onSave: () => void;
  onRestore: () => void;
}

export const VariableVersionFooterActions = ({
  mode,
  head,
  canEdit,
  hasChanges = false,
  isUpdating = false,
  isRestoring = false,
  onClose,
  onBackToView,
  onCancelEdit,
  onEdit,
  onSave,
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

      {mode === 'edit' && (
        <Button size="l" view="outlined" onClick={onCancelEdit}>
          Cancel editing
        </Button>
      )}

      {canEdit && mode === 'view' && head && (
        <Button size="l" view="action" onClick={onEdit}>
          <Button.Icon>
            <Pencil />
          </Button.Icon>
          Edit variable
        </Button>
      )}

      {mode === 'edit' && (
        <Button
          size="l"
          view="action"
          onClick={onSave}
          loading={isUpdating}
          disabled={isUpdating || !hasChanges}
        >
          Save changes
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
