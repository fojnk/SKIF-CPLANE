import { Text } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React, { useEffect, useMemo } from 'react';

import {
  LogComment,
  LogDialog,
  LogVariableActions,
  LogEntity,
} from '@/modules/control-plane/features/logs/show-log/components';
import { LogDiff } from '@/modules/control-plane/features/logs/show-log/components/log-diff';
import { ShowExperimentLogModel } from '@/modules/control-plane/features/logs/show-log/experiment';
import {
  UpdateExperiment,
  UpdateExperimentDs,
} from '@/modules/control-plane/features/logs/show-log/experiment/ui/components';
import { LogAction, LogDataDC } from '@/modules/control-plane/shared/types';
import { pipeDiff } from '@/modules/control-plane/shared/utils/logsHelper';
import { ModalViewProps } from '@/shared/ui/modals';

export const Modal = ({
  open,
  onClose,
  reset,
  payload,
}: ModalViewProps<LogDataDC>) => {
  const [data, loading, failed, pending] = useUnit([
    ShowExperimentLogModel.$data,
    ShowExperimentLogModel.$loading,
    ShowExperimentLogModel.$failed,
    ShowExperimentLogModel.$pending,
  ]);

  useEffect(() => {
    ShowExperimentLogModel.load(payload.id);
    return () => ShowExperimentLogModel.reset();
  }, [payload]);

  const diff = useMemo(() => {
    if (data && data.details) {
      return pipeDiff(data.details);
    }
    return pipeDiff();
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
          if (diff.name || diff.description) {
            return (
              <UpdateExperiment
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
        case LogAction.UpdateDatasetLink: {
          if (diff.dataset_alias) {
            return (
              <UpdateExperimentDs
                diff={diff}
                oldData={data.details.old}
                newData={data.details.new}
              />
            );
          }
          return null;
        }
        case LogAction.DatasetAdd: {
          return (
            <LogEntity
              name={data.details.new?.dataset_alias || 'без названия'}
              label="Связь датасета"
            />
          );
        }
        case LogAction.DatasetDelete: {
          return (
            <LogEntity
              theme="danger"
              name={data.details.old?.dataset_alias || 'без названия'}
              label="Связь датасета"
            />
          );
        }
        case LogAction.New: {
          return (
            <LogEntity
              name={data.details.new?.name || 'без названия'}
              label="Эксперимент"
            />
          );
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
      type="Project"
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
              ShowExperimentLogModel.updateComment({
                new_comment: comment ?? '',
                log_id: payload.id,
                type: 'experiment',
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
