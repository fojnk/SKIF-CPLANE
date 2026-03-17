import { Dialog, Flex, Text, TextArea, Disclosure } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React, { useMemo, useState } from 'react';

import { monacoModel } from '@/modules/control-plane/entities/monaco';
import { ExperimentVariableModel } from '@/modules/control-plane/entities/variables/single';
import { VariableVersionModel } from '@/modules/control-plane/entities/variables/versions/single';
import { VariableUpdateModel } from '@/modules/control-plane/features/variable/update';
import { SetCurrentVersionModel } from '@/modules/control-plane/features/variable/version/set-current';
import {
  VariableShowModel,
  VariableShowPayload,
} from '@/modules/control-plane/features/variable/version/show';
import { VariableVersionFooterActions } from '@/modules/control-plane/features/variable/version/show/ui/components/footer-actions';
import { VariableVersionModalHeader } from '@/modules/control-plane/features/variable/version/show/ui/components/modal-header';
import { VariableDiffEditor } from '@/modules/control-plane/shared/components/diff-viewer';
import { ModalControls } from '@/modules/control-plane/shared/ui/monaco';
import {
  MonacoDialogWrapper,
  SFMonaco,
} from '@/modules/control-plane/shared/ui/sf-monaco';
import { formatData } from '@/modules/control-plane/shared/utils/formatData';
import { getMonacoLanguage } from '@/modules/control-plane/shared/utils/monacoLanguageMapper';
import { GlobalLoader } from '@/shared/ui/loaders';
import { ModalViewProps } from '@/shared/ui/modals';

export const Modal = ({
  open,
  onClose,
  payload,
  reset,
}: ModalViewProps<VariableShowPayload>) => {
  const [comment, setComment] = useState<string>('');
  const [editComment, setEditComment] = useState<string>('');
  const [expandedEditComment, setExpandedEditComment] = useState(false);

  const [versionData, loading, failed] = useUnit([
    VariableVersionModel.$data,
    VariableVersionModel.$loading,
    VariableVersionModel.$failed,
  ]);
  const [variableDataHead, loadingHead, failedHead] = useUnit([
    ExperimentVariableModel.variable.$data,
    ExperimentVariableModel.variable.$loading,
    ExperimentVariableModel.variable.$failed,
  ]);
  const [updateVariable, isUpdating] = useUnit([
    VariableUpdateModel.updateVariable,
    VariableUpdateModel.$pending,
  ]);
  const [restoreVersion, isRestoring] = useUnit([
    SetCurrentVersionModel.onSetCurrent,
    SetCurrentVersionModel.$pending,
  ]);
  const [
    mode,
    editedValue,
    initialValue,
    versionIdName,
    setEditedValue,
    startEdit,
    cancelEdit,
    setMode,
    fontSizeNumber,
  ] = useUnit([
    VariableShowModel.$mode,
    VariableShowModel.$editedValue,
    VariableShowModel.$initialValue,
    VariableShowModel.$versionIdName,
    VariableShowModel.setEditedValue,
    VariableShowModel.startEdit,
    VariableShowModel.cancelEdit,
    VariableShowModel.setMode,
    monacoModel.$fontSizeNumber,
  ]);

  const hasChanges = useMemo(() => {
    return editedValue !== initialValue;
  }, [editedValue, initialValue]);

  const displayValue = mode === 'edit' ? editedValue : initialValue;

  // Форматируем значения для отображения в diff viewer
  const formattedOriginalValue = useMemo(() => {
    if (!initialValue) return '';
    if (payload.item.type === 'json') {
      return formatData(initialValue);
    }
    return initialValue;
  }, [initialValue, payload.item.type]);

  const formattedHeadValue = useMemo(() => {
    if (!variableDataHead?.value) return '';
    if (payload.item.type === 'json') {
      return formatData(variableDataHead.value);
    }
    return variableDataHead.value;
  }, [variableDataHead, payload.item.type]);

  const handleEditClick = () => {
    if (mode === 'view') {
      startEdit();
    }
  };

  const handleBackToView = () => {
    setMode('view');
  };

  const handleSave = () => {
    updateVariable({
      variable: {
        id: payload.item.id,
        name: payload.item.name,
        type: payload.item.type,
        value: editedValue,
      },
      comment: editComment?.trim() || undefined,
    });
  };

  const handleRestore = () => {
    restoreVersion({
      variable_id: payload.item.id,
      version_id: payload.item.version_id!,
      comment: comment || undefined,
    });
  };

  const handleValueChange = (value: string | undefined) => {
    setEditedValue(value || '');
  };

  const renderContent = () => {
    if (loading || (mode === 'compare' && loadingHead)) {
      return <GlobalLoader absolute />;
    }

    if (failed) {
      return (
        <Flex
          direction="column"
          alignItems="center"
          justifyContent="center"
          style={{ height: '200px' }}
        >
          <Text variant="body-2" color="danger">
            Error fetching version data
          </Text>
        </Flex>
      );
    }

    if (mode === 'compare' && failedHead) {
      return (
        <Flex
          direction="column"
          alignItems="center"
          justifyContent="center"
          style={{ height: '200px' }}
        >
          <Text variant="body-2" color="danger">
            Error fetching head version data
          </Text>
        </Flex>
      );
    }

    if (!versionData) {
      return (
        <Flex
          direction="column"
          alignItems="center"
          justifyContent="center"
          style={{ height: '200px' }}
        >
          <Text variant="body-2" color="secondary">
            No data available
          </Text>
        </Flex>
      );
    }

    if (mode === 'compare' && !variableDataHead) {
      return (
        <Flex
          direction="column"
          alignItems="center"
          justifyContent="center"
          style={{ height: '200px' }}
        >
          <Text variant="body-2" color="secondary">
            No head version data available
          </Text>
        </Flex>
      );
    }

    const language = getMonacoLanguage(payload.item.type!);

    // Режим сравнения
    if (mode === 'compare') {
      return (
        <VariableDiffEditor
          language={language}
          original={formattedOriginalValue}
          modified={formattedHeadValue}
          showHeader
          version1={payload.item.version_id_name}
          version2={variableDataHead?.version_id_name}
          headVersion={variableDataHead?.version_id_name}
        />
      );
    }

    return (
      <div style={{ position: 'relative', height: '100%', minHeight: 200 }}>
        <MonacoDialogWrapper style={{ position: 'absolute', inset: 0 }}>
          <SFMonaco
            language={language}
            value={displayValue}
            onChange={mode === 'edit' ? handleValueChange : undefined}
            className="monaco-viewer"
            options={{
              readOnly: mode === 'view' || mode === 'restore',
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              fontSize: fontSizeNumber,
            }}
          />
        </MonacoDialogWrapper>
      </div>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      onTransitionOutComplete={() => {
        reset();
      }}
      size="l"
      disableEscapeKeyDown
      disableOutsideClick
      className="variable-dialog"
    >
      <Dialog.Header
        caption={
          <VariableVersionModalHeader
            variableName={payload.item.name}
            variableType={payload.item.type}
            mode={mode}
            head={payload.head}
            canEdit={payload.canEdit}
            hasChanges={hasChanges}
            versionIdName={versionIdName}
            versionValue={formattedOriginalValue}
            setMode={setMode}
            comment={versionData?.comment}
          />
        }
      />
      <Dialog.Body>
        <Flex direction="column" gap={3} style={{ height: '100%' }}>
          <Flex
            direction="column"
            style={{ flexGrow: 1, height: '100%', position: 'relative' }}
          >
            {renderContent()}
          </Flex>
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
                    maxHeight: '300px',
                  },
                }}
              />
            </Flex>
          )}
          {mode === 'edit' && (
            <Flex direction="column" gap={2}>
              <Disclosure
                summary={
                  <Text
                    variant="body-1"
                    color="secondary"
                    style={{ userSelect: 'none' }}
                  >
                    Comment
                  </Text>
                }
                arrowPosition="end"
                expanded={expandedEditComment}
                onUpdate={setExpandedEditComment}
              />
              {expandedEditComment && (
                <TextArea
                  value={editComment}
                  onUpdate={setEditComment}
                  placeholder="Enter comment"
                  rows={2}
                  size="m"
                  controlProps={{
                    style: {
                      resize: 'vertical',
                      minHeight: '30px',
                      maxHeight: '120px',
                    },
                  }}
                />
              )}
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
          <VariableVersionFooterActions
            mode={mode}
            head={payload.head}
            canEdit={payload.canEdit}
            hasChanges={hasChanges}
            isUpdating={isUpdating}
            isRestoring={isRestoring}
            onClose={onClose}
            onBackToView={handleBackToView}
            onCancelEdit={cancelEdit}
            onEdit={handleEditClick}
            onSave={handleSave}
            onRestore={handleRestore}
          />
        </Flex>
      </Dialog.Footer>
    </Dialog>
  );
};
