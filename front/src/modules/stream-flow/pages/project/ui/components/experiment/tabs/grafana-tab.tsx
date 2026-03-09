import { Flex, Text, useTheme } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React, { useEffect, useMemo } from 'react';

import { projectPageModel } from '@/modules/stream-flow/pages/project';
import { streamFlowApi } from '@/modules/stream-flow/shared/api';
import { ErrorMessage } from '@/modules/stream-flow/shared/components/sf-errors';
import { GlobalLoader } from '@/shared/ui/loaders';

interface Props {
  experiment_id: number;
}

interface GrafanaTabState {
  loading: boolean;
  failed: boolean;
  data: streamFlowApi.dc.DtoExperimentURLDC | null;
  hasData: boolean;
}

interface GrafanaTabHandlers {
  onReload: () => void;
}

/**
 * Кастомный хук для управления состоянием вкладки Grafana
 */
const useGrafanaTab = (
  experiment_id: number,
): {
  state: GrafanaTabState;
  handlers: GrafanaTabHandlers;
} => {
  const {
    load,
    $loading: loading,
    $data: data,
    $failed: failed,
    reset,
  } = useUnit(projectPageModel.experiment.grafana);

  const state = useMemo<GrafanaTabState>(
    () => ({
      loading,
      failed,
      data,
      hasData: data !== null && Boolean(data.url),
    }),
    [loading, failed, data],
  );

  const handlers = useMemo<GrafanaTabHandlers>(
    () => ({
      onReload: () => load(experiment_id),
    }),
    [load, experiment_id],
  );

  // Эффект для загрузки данных
  useEffect(() => {
    load(experiment_id);
    return () => {
      reset();
    };
  }, [experiment_id, load, reset]);

  return { state, handlers };
};

/**
 * Рендерит iframe с Grafana с учетом темы приложения
 */
const renderGrafanaIframe = (
  item: streamFlowApi.dc.DtoExperimentURLDC,
  isDarkTheme: boolean,
): JSX.Element | null => {
  if (!item.url) return null;

  const url = new URL(item.url);
  const theme = isDarkTheme ? 'dark' : 'light';
  url.searchParams.set('theme', theme);

  return (
    <iframe
      src={url.toString()}
      style={{
        width: '100%',
        height: '100%',
        border: 'none',
      }}
      title="Grafana Dashboard"
      allowFullScreen
    />
  );
};

/**
 * Компонент вкладки Grafana experiment
 *
 * Отображает:
 * - Iframe с Grafana дашбордом для experiment
 * - Автоматическую синхронизацию темы с приложением (&theme=light/dark)
 * - Обработку состояний загрузки и ошибок
 * - Сообщение об отсутствии URL
 */
export const GrafanaTab = ({ experiment_id }: Props) => {
  const { state, handlers } = useGrafanaTab(experiment_id);
  const isDarkTheme = useTheme() === 'dark';

  if (state.loading && state.data === null) {
    return <GlobalLoader absolute />;
  }

  if (state.failed) {
    return (
      <ErrorMessage
        message="Не удалось загрузить URL Grafana"
        reload={handlers.onReload}
        pending={state.loading}
        padding
      />
    );
  }

  if (!state.hasData) {
    return (
      <Flex className="sf-l-pl sf-l-pr sf-l-pt">
        <Text variant="body-1" color="secondary">
          URL Grafana не найден
        </Text>
      </Flex>
    );
  }

  return (
    <Flex style={{ width: '100%', height: '100%', position: 'relative' }}>
      {renderGrafanaIframe(state.data!, isDarkTheme)}
    </Flex>
  );
};
