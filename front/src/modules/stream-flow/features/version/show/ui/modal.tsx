import { Dialog, Flex, Text, TextArea } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React, { useMemo, useState } from 'react';

import {
  ShowVersionModel,
  ShowVersionPayload,
} from '@/modules/stream-flow/features/version/show';
import {
  ExperimentVersionModalHeader,
  ExperimentVersionFooterActions,
} from '@/modules/stream-flow/features/version/show/ui/components';
import {
  VariableDiffEditor,
  JsonViewer,
} from '@/modules/stream-flow/shared/components/diff-viewer';
import { ErrorMessage } from '@/modules/stream-flow/shared/components/sf-errors';
import { ModalControls } from '@/modules/stream-flow/shared/ui/monaco';
import { formatData } from '@/modules/stream-flow/shared/utils/formatData';
import { GlobalLoader } from '@/shared/ui/loaders';
import { ModalViewProps } from '@/shared/ui/modals';

export const Modal = ({
  open,
  onClose,
  payload,
  reset,
}: ModalViewProps<ShowVersionPayload>) => {
  const isHead = payload.version_id === payload.head_id;
  const [comment, setComment] = useState<string>('');

  const [
    mode,
    setMode,
    loading,
    data,
    failed,
    reload,
    restoreVersion,
    pending,
    loadingHead,
    dataHead,
    failedHead,
    reloadHead,
  ] = useUnit([
    ShowVersionModel.$mode,
    ShowVersionModel.setMode,
    ShowVersionModel.$loading,
    ShowVersionModel.$data,
    ShowVersionModel.$error,
    ShowVersionModel.reload,
    ShowVersionModel.restoreVersion,
    ShowVersionModel.$pending,
    ShowVersionModel.$loadingHead,
    ShowVersionModel.$dataHead,
    ShowVersionModel.$errorHead,
    ShowVersionModel.reloadHead,
  ]);

  const handleRestore = () => {
    restoreVersion({
      comment: comment || undefined,
      experiment_id: payload.experiment_id,
      version_id: payload.version_id,
    });
  };

  const handleClose = () => {
    onClose();
  };

  const handleBackToView = () => {
    setMode('view');
  };

  // Форматируем JSON для отображения
  const formattedOriginalValue = useMemo(() => {
    if (!data?.config) return '';
    return formatData(data.config);
  }, [data?.config]);

  const formattedHeadValue = useMemo(() => {
    if (!dataHead?.config) return '';
    return formatData(dataHead.config);
  }, [dataHead?.config]);

  const renderContent = () => {
    if (
      (loading && !data) ||
      (loadingHead && !dataHead && mode === 'compare')
    ) {
      return <GlobalLoader absolute />;
    }

    if (failed) {
      return <ErrorMessage reload={reload} />;
    }
    if (failedHead && mode === 'compare') {
      return <ErrorMessage reload={reloadHead} />;
    }

    if (!data) {
      return <div>No data available</div>;
    }

    if (!dataHead && mode === 'compare') {
      return <div>No head data available</div>;
    }

    if (mode === 'compare') {
      return (
        <VariableDiffEditor
          language="json"
          original={formattedOriginalValue}
          modified={formattedHeadValue}
          showHeader
          version1={payload.version}
          version2={dataHead?.version_id}
          headVersion={dataHead?.version_id}
        />
      );
    }

    return <JsonViewer config={data.config || ''} />;
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
          <ExperimentVersionModalHeader
            experimentName={payload.experiment_name}
            version={payload.version}
            mode={mode}
            head={isHead}
            versionValue={formattedOriginalValue}
            setMode={setMode}
            comment={data?.comment}
          />
        }
      />
      <Dialog.Body>
        <Flex direction="column" style={{ width: '100%', height: '100%' }}>
          <div style={{ flex: 1, minHeight: 0 }}>{renderContent()}</div>
          {mode === 'restore' && (
            <Flex
              direction="column"
              gap={1}
              style={{ marginTop: '12px', flexShrink: 0 }}
            >
              <Text variant="body-1">Comment:</Text>
              <TextArea
                value={comment}
                onUpdate={setComment}
                placeholder="Enter comment"
                rows={2}
                size="m"
                controlProps={{
                  style: {
                    resize: 'vertical',
                    minHeight: '30px',
                    maxHeight: '400px',
                  },
                }}
              />
            </Flex>
          )}
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
          <ModalControls
            showSideBySide={mode === 'compare'}
            showCollapseUnchanged={mode === 'compare'}
          />
          <ExperimentVersionFooterActions
            mode={mode}
            isRestoring={pending}
            onClose={handleClose}
            onBackToView={handleBackToView}
            onRestore={handleRestore}
          />
        </Flex>
      </Dialog.Footer>
    </Dialog>
  );
};
