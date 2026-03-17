import { Dialog, Flex, Button, SegmentedRadioGroup } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React, { useMemo } from 'react';

import { ExperimentApplyModel } from '@/modules/control-plane/features/experiment/apply';
import {
  JsonDiffViewer,
  JsonViewer,
} from '@/modules/control-plane/shared/components/diff-viewer';
import { ErrorMessage } from '@/modules/control-plane/shared/components/sf-errors';
import { ModalControls } from '@/modules/control-plane/shared/ui';
import { GlobalLoader } from '@/shared/ui/loaders';
import { ModalViewProps } from '@/shared/ui/modals';

import { ApplyExperimentPayload } from '../types';

export const Modal = ({
  open,
  onClose,
  payload,
  reset,
}: ModalViewProps<ApplyExperimentPayload>) => {
  const [loading, data, pending, onApply, load, failed, tab, error, setTab] =
    useUnit([
      ExperimentApplyModel.$loading,
      ExperimentApplyModel.$data,
      ExperimentApplyModel.$pending,
      ExperimentApplyModel.onApply,
      ExperimentApplyModel.load,
      ExperimentApplyModel.$failed,
      ExperimentApplyModel.$tab,
      ExperimentApplyModel.$error,
      ExperimentApplyModel.setTab,
    ]);

  const handleClose = () => {
    onClose();
  };
  const handleApply = () => {
    onApply(payload.experiment_id);
  };

  const errorViewer = useMemo(() => {
    if (!error) return null;
    return <JsonViewer key="error-viewer" config={error} />;
  }, [error]);

  const diffViewer = useMemo(() => {
    if (!data) return null;
    return (
      <JsonDiffViewer
        key="diff-viewer"
        originalJson={data.applied_config ?? ''}
        modifiedJson={data.saved_config ?? ''}
      />
    );
  }, [data]);

  const renderVariableContent = () => {
    if (failed) {
      return <ErrorMessage reload={() => load(payload.experiment_id)} />;
    }

    if (loading) {
      return <GlobalLoader absolute />;
    }

    if (!data) {
      return <ErrorMessage reload={() => load(payload.experiment_id)} />;
    }

    return (
      <div style={{ width: '100%', height: '100%' }}>
        <div
          style={{
            display: tab === 'error' ? 'block' : 'none',
            width: '100%',
            height: '100%',
          }}
        >
          {errorViewer}
        </div>
        <div
          style={{
            display: tab === 'diff' ? 'block' : 'none',
            width: '100%',
            height: '100%',
          }}
        >
          {diffViewer}
        </div>
      </div>
    );
  };

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
      <Dialog.Header
        caption={
          <Flex
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            gap={2}
            style={{ width: '100%', paddingRight: '14px' }}
          >
            <Flex alignItems="center" gap={4}>
              <span>{payload.name}</span>
              {error && (
                <SegmentedRadioGroup value={tab} onUpdate={setTab} size="s">
                  <SegmentedRadioGroup.Option value="diff" content="Diff" />
                  <SegmentedRadioGroup.Option value="error" content="Error" />
                </SegmentedRadioGroup>
              )}
            </Flex>
            <ModalControls />
          </Flex>
        }
      />
      <Dialog.Body>{renderVariableContent()}</Dialog.Body>
      <Dialog.Footer>
        <Flex
          direction="row"
          justifyContent="flex-end"
          gap={2}
          style={{ width: '100%' }}
        >
          <Button
            size="l"
            view="outlined"
            onClick={handleClose}
            loading={pending}
          >
            Close
          </Button>
          <Button
            size="l"
            view="action"
            onClick={handleApply}
            loading={pending}
          >
            Apply changes
          </Button>
        </Flex>
      </Dialog.Footer>
    </Dialog>
  );
};
