import { Label, Text } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React, { useEffect, useMemo } from 'react';

import {
  LogComment,
  LogDialog,
  LogEntity,
} from '@/modules/control-plane/features/logs/show-log/components';
import { LogDiff } from '@/modules/control-plane/features/logs/show-log/components/log-diff';
import { ShowDatasetLogModel } from '@/modules/control-plane/features/logs/show-log/dataset';
import { UpdateDataset } from '@/modules/control-plane/features/logs/show-log/dataset/ui/components';
import { LogAction, LogDataDC } from '@/modules/control-plane/shared/types';
import {
  dsDiff,
  dsHasDiff,
} from '@/modules/control-plane/shared/utils/logsHelper';
import { ModalViewProps } from '@/shared/ui/modals';

export const Modal = ({
  open,
  onClose,
  reset,
  payload,
}: ModalViewProps<LogDataDC>) => {
  const [data, loading, failed, pending] = useUnit([
    ShowDatasetLogModel.$data,
    ShowDatasetLogModel.$loading,
    ShowDatasetLogModel.$failed,
    ShowDatasetLogModel.$pending,
  ]);

  useEffect(() => {
    ShowDatasetLogModel.load(payload.id);
    return () => ShowDatasetLogModel.reset();
  }, [payload]);

  const diff = useMemo(() => {
    if (data && data.details) {
      return dsDiff(data.details);
    }
    return dsDiff();
  }, [data]);

  const isBig = useMemo(() => {
    return !!(payload.act === LogAction.Update && (diff.schema || diff.params));
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
          if (diff.schema) {
            return (
              <LogDiff
                name="Изменения схемы"
                oldValue={data.details.old?.schema ?? ''}
                newValue={data.details.new?.schema ?? ''}
              />
            );
          }
          if (diff.params) {
            return (
              <LogDiff
                name="Изменения конфига"
                oldValue={data.details.old?.params ?? ''}
                newValue={data.details.new?.params ?? ''}
              />
            );
          }
          if (dsHasDiff(diff)) {
            return (
              <UpdateDataset
                diff={diff}
                oldData={data.details.old}
                newData={data.details.new}
              />
            );
          }
          return null;
        }
        case LogAction.New: {
          if (data.details.new) {
            const isManaged = data.details.new.managed ? (
              <Label size="xs" theme="warning">
                Управляемый
              </Label>
            ) : null;
            const isPublic = data.details.new.public ? (
              <Label size="xs" theme="success">
                Публичный
              </Label>
            ) : null;
            return (
              <LogEntity
                name={data.details.new?.name || 'без названия'}
                label="Датасет"
                afterLabel={
                  <>
                    {isManaged}
                    {isPublic}
                  </>
                }
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
      type="Dataset"
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
              ShowDatasetLogModel.updateComment({
                new_comment: comment ?? '',
                log_id: payload.id,
                type: 'dataset',
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
