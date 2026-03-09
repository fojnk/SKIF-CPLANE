import { ClipboardButton, Flex, Link, Text } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React, { useEffect, useMemo } from 'react';

import { projectPageModel } from '@/modules/stream-flow/pages/project';
import { streamFlowApi } from '@/modules/stream-flow/shared/api';
import { ErrorMessage } from '@/modules/stream-flow/shared/components/sf-errors';
import { GlobalLoader } from '@/shared/ui/loaders';

interface Props {
  project_id: number;
}
type ProjectLink = streamFlowApi.dc.DtoProjectURLDC;
interface LinksTabState {
  loading: boolean;
  failed: boolean;
  data: ProjectLink[] | null;
  hasLinks: boolean;
}

interface LinksTabHandlers {
  onReload: () => void;
}

/**
 * Кастомный хук для управления состоянием вкладки ссылок
 */
const useLinksTab = (
  project_id: number,
): {
  state: LinksTabState;
  handlers: LinksTabHandlers;
} => {
  const [load, loading, data, failed, reset] = useUnit([
    projectPageModel.project.links.load,
    projectPageModel.project.links.$loading,
    projectPageModel.project.links.$data,
    projectPageModel.project.links.$failed,
    projectPageModel.project.links.reset,
  ]);

  // Мемоизация состояния
  const state = useMemo<LinksTabState>(
    () => ({
      loading,
      failed,
      data,
      hasLinks: data !== null && data.length > 0,
    }),
    [loading, failed, data],
  );

  // Мемоизация обработчиков
  const handlers = useMemo<LinksTabHandlers>(
    () => ({
      onReload: () => load(project_id),
    }),
    [load, project_id],
  );

  // Эффект для загрузки данных
  useEffect(() => {
    load(project_id);
    return () => {
      reset();
    };
  }, [project_id, load, reset]);

  return { state, handlers };
};

/**
 * Рендерит элемент ссылки
 */
const renderLinkItem = (item: ProjectLink, index: number) => {
  if (!item.url) return null;

  return (
    <Flex direction="row" gap={2} alignItems="center" key={index}>
      <Link href={item.url} target="_blank">
        <Text variant="body-2" ellipsis>
          {item.name}
        </Text>
      </Link>
      <ClipboardButton
        className="copy-secondary no-shrink"
        text={item.url}
        size="s"
        tooltipInitialText="Скопировать ссылку"
        tooltipSuccessText="Скопировано"
      />
    </Flex>
  );
};

/**
 * Компонент вкладки ссылок experiment
 *
 * Отображает:
 * - Список внешних ссылок связанных с experiment
 * - Кнопки копирования ссылок
 * - Обработку состояний загрузки и ошибок
 * - Сообщение об отсутствии ссылок
 */
export const LinksTab = ({ project_id }: Props) => {
  const { state, handlers } = useLinksTab(project_id);

  // Загрузка
  if (state.loading && state.data === null) {
    return <GlobalLoader absolute />;
  }

  // Ошибка
  if (state.failed) {
    return (
      <ErrorMessage
        message="Не удалось загрузить ссылки проекта"
        reload={handlers.onReload}
        pending={state.loading}
      />
    );
  }

  // Нет ссылок
  if (!state.hasLinks) {
    return (
      <Text variant="body-1" color="secondary">
        Ссылки не найдены
      </Text>
    );
  }

  return (
    <Flex direction="column" justifyContent="flex-start" gapRow={2}>
      {state.data!.map((item, index) => renderLinkItem(item, index))}
    </Flex>
  );
};
