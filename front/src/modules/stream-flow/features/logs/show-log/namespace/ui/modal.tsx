import { Text } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React, { useEffect, useMemo } from 'react';

import {
  LogComment,
  LogDialog,
  LogVariableActions,
  LogEntity,
} from '@/modules/stream-flow/features/logs/show-log/components';
import { LogDiff } from '@/modules/stream-flow/features/logs/show-log/components/log-diff';
import { ShowNamespaceLogModel } from '@/modules/stream-flow/features/logs/show-log/namespace';
import { UpdateNamespace } from '@/modules/stream-flow/features/logs/show-log/namespace/ui/components';
import { LogAction, LogDataDC } from '@/modules/stream-flow/shared/types';
import {
  nsHasDiff,
  nsDiff,
} from '@/modules/stream-flow/shared/utils/logsHelper';
import { ModalViewProps } from '@/shared/ui/modals';

export const Modal = ({
  open,
  onClose,
  reset,
  payload,
}: ModalViewProps<LogDataDC>) => {
  const [data, loading, failed, pending] = useUnit([
    ShowNamespaceLogModel.$data,
    ShowNamespaceLogModel.$loading,
    ShowNamespaceLogModel.$failed,
    ShowNamespaceLogModel.$pending,
  ]);

  useEffect(() => {
    ShowNamespaceLogModel.load(payload.id);
    return () => ShowNamespaceLogModel.reset();
  }, [payload]);

  const diff = useMemo(() => {
    if (data && data.details) {
      return nsDiff(data.details);
    }
    return nsDiff();
  }, [data]);

  const isBig = useMemo(() => {
    const updated = !!(payload.act === LogAction.Update && diff.config);
    const variables = [
      LogAction.NewVariable,
      LogAction.UpdateVariable,
      LogAction.DeleteVariable,
    ];
    return updated || variables.includes(payload.act as LogAction);
  }, [payload, diff]);

  const renderContent = () => {
    if ((failed || !data) && !loading)
      return (
        <Text variant="body-1" color="danger">
          Не удалось загрузить данные лога
        </Text>
      );
    if (data && data.details) {
      switch (data.act) {
        case LogAction.Update: {
          if (diff.config) {
            return (
              <LogDiff
                name="Изменения конфига"
                oldValue={data.details.old?.config ?? ''}
                newValue={data.details.new?.config ?? ''}
              />
            );
          }
          if (nsHasDiff(diff)) {
            return (
              <UpdateNamespace
                diff={diff}
                oldData={data.details.old}
                newData={data.details.new}
              />
            );
          }
          return null;
        }
        case LogAction.UpdateVariable:
        case LogAction.NewVariable:
        case LogAction.DeleteVariable: {
          return (
            <LogVariableActions
              action={data.act}
              name={data.details.new?.variable_name || 'без названия'}
              type={data.details.new?.variable_type || 'string'}
              value={data.details.new?.variable_value || ''}
              oldName={data.details.old?.variable_name || 'без названия'}
              oldValue={data.details.old?.variable_value || ''}
              oldType={data.details.old?.variable_type || 'string'}
            />
          );
        }
        case LogAction.New: {
          if (data.details.new) {
            return (
              <LogEntity
                name={data.details.new?.name || 'без названия'}
                label="Рабочее пространство"
              />
            );
          }
        }
      }
    }
    return null;
  };

  return (
    <LogDialog
      open={open}
      onClose={onClose}
      reset={reset}
      type="Workspace"
      log={payload}
      loading={loading}
      isBig={isBig}
      comment={
        data ? (
          <LogComment
            logComment={data.comment ?? ''}
            pending={pending}
            userName={payload.user}
            onSaveChanges={(comment) =>
              ShowNamespaceLogModel.updateComment({
                new_comment: comment ?? '',
                log_id: payload.id,
                type: 'namespace',
              })
            }
          />
        ) : null
      }
    >
      {renderContent()}
    </LogDialog>
  );
};
