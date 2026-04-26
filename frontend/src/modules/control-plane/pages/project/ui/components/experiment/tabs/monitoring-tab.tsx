import { ArrowRotateRight } from '@gravity-ui/icons';
import { Flex, Text } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React, { useEffect, useMemo } from 'react';

import {
  MonitoringLogModel,
  ShowLogPayload,
} from '@/modules/control-plane/features/logs/monitoring-log';
import { projectPageModel } from '@/modules/control-plane/pages/project';
import { controlPlaneApi } from '@/modules/control-plane/shared/api';
import { ErrorMessage } from '@/modules/control-plane/shared/components/sf-errors';
import { ButtonWithProgress, LogViewer } from '@/modules/control-plane/shared/ui';
import { MonitoringSettingsButton } from '@/modules/control-plane/shared/ui/buttons';
import { getPipeStatusColor } from '@/modules/control-plane/shared/utils/getStatusColor';
import { Button } from '@/shared/ui/button';
import { GlobalLoader } from '@/shared/ui/loaders';

interface Props {
  experiment_id: number;
}

interface MonitoringTabState {
  loading: boolean;
  failed: boolean;
  status: controlPlaneApi.dc.ResponsesExperimentStatusResponseDC | null;
  hasStatus: boolean;
  hasMessage: boolean;
  hasDebug: boolean;
  requestLoading: boolean;
  requestData: any | null;
  hasRequestData: boolean;
}

interface MonitoringTabHandlers {
  onRefresh: () => void;
  onReload: () => void;
  showLogModal: (params: {
    log: string;
    title: string;
    logType: 'json' | 'plaintext';
  }) => void;
}

/**
 * Кастомный хук для управления состоянием вкладки мониторинга
 */
const useMonitoringTab = (
  experiment_id: number,
): {
  state: MonitoringTabState;
  handlers: MonitoringTabHandlers;
} => {
  const showLogModal = useUnit(MonitoringLogModel.start);

  const {
    $loading: loading,
    $data: status,
    load,
    $failed: failed,
    reset,
  } = useUnit(projectPageModel.experiment.status);

  const {
    $loading: requestLoading,
    $data: requestData,
    load: requestLoad,
    reset: requestReset,
  } = useUnit(projectPageModel.experiment.supervisor);

  // Мемоизация состояния
  const state = useMemo<MonitoringTabState>(
    () => ({
      loading,
      failed,
      status,
      hasStatus: status !== null,
      hasMessage: Boolean(status?.message && status.message !== ''),
      hasDebug: Boolean(status?.debug && status.debug !== ''),
      requestLoading,
      requestData,
      hasRequestData: Boolean(requestData),
    }),
    [loading, failed, status, requestLoading, requestData],
  );

  // Мемоизация обработчиков
  const handlers = useMemo<MonitoringTabHandlers>(
    () => ({
      onRefresh: () => {
        // Не делаем запрос если уже идет загрузка
        if (loading || requestLoading) return;

        load(experiment_id);
        requestLoad(experiment_id);
      },
      onReload: () => {
        // Перезагрузка всегда выполняется, даже если идет загрузка
        load(experiment_id);
        requestLoad(experiment_id);
      },
      showLogModal: (params: ShowLogPayload) => showLogModal(params),
    }),
    [load, requestLoad, experiment_id, showLogModal, loading, requestLoading],
  );

  // Эффект для загрузки статуса с интервалом
  useEffect(() => {
    const loadStatus = () => {
      load(experiment_id);
      requestLoad(experiment_id);
    };

    loadStatus();

    return () => {
      reset();
      requestReset();
    };
  }, [experiment_id, load, requestLoad, reset, requestReset]);

  return { state, handlers };
};

export const MonitoringTab = ({ experiment_id }: Props) => {
  const { state, handlers } = useMonitoringTab(experiment_id);

  if (state.loading && !state.hasStatus) {
    return <GlobalLoader absolute />;
  }

  if (state.failed) {
    return (
      <ErrorMessage
        message="Не удалось загрузить статус эксперимента"
        reload={handlers.onReload}
        pending={state.loading}
      />
    );
  }

  if (!state.hasStatus) {
    return (
      <Text variant="body-1" color="secondary">
        Статус не найден
      </Text>
    );
  }

  return (
    <Flex direction="column" style={{ height: '100%', overflow: 'hidden' }}>
      <Flex
        direction="column"
        gapRow={3}
        className="sf-l-pr sf-l-pl"
        style={{
          paddingTop: '12px',
          paddingBottom: '12px',
          flexShrink: 0,
          boxShadow: 'inset 0 -1px 0 0 var(--g-color-line-generic)',
        }}
      >
        <Flex direction="row" justifyContent="space-between">
          <Flex direction="row" gap={2} alignItems="center">
            <Text variant="subheader-2" color="primary">
              <b>Статус:</b>
            </Text>
            <ButtonWithProgress
              view="normal"
              size="m"
              loading={state.loading}
              onClick={handlers.onRefresh}
              intervalMs={10000}
              style={{
                backgroundColor: 'var(--g-color-base-float)',
                boxShadow: '0 2px 6px 0 var(--g-color-sfx-shadow)',
              }}
            >
              <ButtonWithProgress.Icon>
                <ArrowRotateRight />
              </ButtonWithProgress.Icon>
              Обновить
            </ButtonWithProgress>
            {state.hasDebug && (
              <Button
                onClick={() =>
                  handlers.showLogModal({
                    log: state.status!.debug!,
                    title: 'Отладка ответа',
                    logType: 'json',
                  })
                }
              >
                Отладка ответа
              </Button>
            )}
            {state.hasRequestData && (
              <Button
                onClick={() =>
                  handlers.showLogModal({
                    log: state.requestData,
                    title: 'Отладка запроса',
                    logType: 'json',
                  })
                }
              >
                Отладка запроса
              </Button>
            )}
          </Flex>
          <Flex direction="row" gap={2} alignItems="center">
            <MonitoringSettingsButton />
          </Flex>
        </Flex>

        <Flex direction="row" gap={2} alignItems="center">
          {state.status!.status && (
            <Text
              variant="body-2"
              color={getPipeStatusColor(state.status!.status)}
            >
              {state.status!.summary ?? 'нет сводки'}
            </Text>
          )}
        </Flex>
      </Flex>
      {state.hasMessage && (
        <div style={{ flex: 1, minHeight: 0 }}>
          <LogViewer content={state.status!.message || ''} />
        </div>
      )}
    </Flex>
  );
};
