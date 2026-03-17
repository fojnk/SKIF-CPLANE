import { Dialog, Flex, Text, TextArea } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React, { useMemo, useState } from 'react';

import {
  ShowVersionModel,
  ShowVersionPayload,
} from '@/modules/control-plane/features/dataset/version/show';
import {
  VariableDiffEditor,
  JsonViewer,
} from '@/modules/control-plane/shared/components/diff-viewer';
import { ErrorMessage } from '@/modules/control-plane/shared/components/sf-errors';
import { ModalControls } from '@/modules/control-plane/shared/ui/monaco';
import { formatData } from '@/modules/control-plane/shared/utils/formatData';
import { GlobalLoader } from '@/shared/ui/loaders';
import { ModalViewProps } from '@/shared/ui/modals';

import { ModalHeader, FooterActions } from './components';

type Tab = 'config' | 'schema';

export const Modal = ({
  open,
  onClose,
  payload,
  reset,
}: ModalViewProps<ShowVersionPayload>) => {
  const isHead = payload.version_id === payload.head_id;
  const [comment, setComment] = useState<string>('');
  const [tab, setTab] = useState<Tab>('config');

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
      dataset_id: payload.dataset_id,
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
    const source = tab === 'config' ? data?.params : data?.schema;
    if (!source) return '';
    return formatData(source);
  }, [data?.params, data?.schema, tab]);

  const formattedHeadValue = useMemo(() => {
    const source = tab === 'config' ? dataHead?.params : dataHead?.schema;
    if (!source) return '';
    return formatData(source);
  }, [dataHead?.params, dataHead?.schema, tab]);

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

    const configToShow = tab === 'config' ? data.params : data.schema;
    return <JsonViewer config={configToShow || ''} />;
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
          <ModalHeader
            experimentName={payload.dataset_name}
            version={payload.version}
            mode={mode}
            head={isHead}
            setMode={setMode}
            isManaged={data?.managed}
            isPublic={data?.public}
            dsType={data?.type}
            tab={tab}
            setTab={setTab}
            isHeadManaged={dataHead?.managed}
            isHeadPublic={dataHead?.public}
            versionValue={formattedOriginalValue}
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
          <FooterActions
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
