import { ChevronDownWide } from '@gravity-ui/icons';
import { Flex, Tab, TabList, TabProvider } from '@gravity-ui/uikit';
import cx from 'clsx';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { useResizer } from '@/modules/control-plane/shared/ui/resizer';

import { DebugTabId } from '../types';
import './debug-sidebar.scss';
import '@/modules/control-plane/shared/ui/resizer/resizer.scss';

interface DebugSidebarProps {
  /** Контент для таба Data */
  dataContent?: React.ReactNode;
  /** Контент для таба Errors */
  errorsContent?: React.ReactNode;
  /** Контент для таба Logs */
  logsContent?: React.ReactNode;
  /** Контент для таба Cubes */
  cubesContent?: React.ReactNode;
  /** CSS класс для контейнера */
  className?: string;
  /** ID для сохранения размера в localStorage */
  pageId: string;
  /** Минимальная высота панели */
  minHeight?: number;
  /** Максимальная высота панели */
  maxHeight?: number;
  /** Показать/скрыть панель */
  showPanel?: boolean;
  /** Callback для переключения видимости панели */
  togglePanel?: () => void;
  /** Активный таб */
  activeTab?: DebugTabId;
  /** Callback для изменения активного таба */
  onTabChange?: (tab: DebugTabId) => void;
  /** Показать таб Errors */
  showErrorsTab?: boolean;
  /** Количество ошибок для отображения в заголовке таба */
  errorsCount?: number;
  /** Показать таб Logs */
  showLogsTab?: boolean;
  /** Количество строк логов для отображения в заголовке таба */
  logsCount?: number;
  /** Показать таб Cubes */
  showCubesTab?: boolean;
  /** Количество кубов для отображения в заголовке таба */
  cubesCount?: number;
}

/**
 * Панель внизу экрана с возможностью изменения размера по вертикали
 * Инкапсулирует логику useResizer для вертикального ресайза
 */
export const DebugSidebar: React.FC<DebugSidebarProps> = ({
  dataContent,
  errorsContent,
  logsContent,
  cubesContent,
  className,
  pageId,
  minHeight = 100,
  maxHeight,
  showPanel = true,
  togglePanel,
  activeTab: externalActiveTab,
  onTabChange,
  showErrorsTab = false,
  errorsCount = 0,
  showLogsTab = true,
  logsCount = 0,
  showCubesTab = true,
  cubesCount = 0,
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState<DebugTabId>(
    externalActiveTab || 'data',
  );

  // Синхронизация с внешним activeTab
  useEffect(() => {
    if (externalActiveTab && externalActiveTab !== internalActiveTab) {
      setInternalActiveTab(externalActiveTab);
    }
  }, [externalActiveTab, internalActiveTab]);

  // Обработчик смены таба
  const handleTabChange = (tab: DebugTabId) => {
    setInternalActiveTab(tab);
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  const [ref, resizerRef] = useResizer({
    size: {
      minHeight,
      maxHeight,
    },
    canCollapse: false,
    pageId,
  });

  const hoverTimeoutRef = useRef<number | null>(null);
  const resizerElementRef = useRef<HTMLDivElement | null>(null);
  const panelElementRef = useRef<HTMLDivElement | null>(null);

  // Комбинированный ref для панели - устанавливаем начальную высоту 300px
  const combinedPanelRef = useCallback(
    (node: HTMLDivElement | null) => {
      panelElementRef.current = node;
      ref(node);

      // Устанавливаем начальную высоту только если нет сохранённого значения
      if (node) {
        const resizerId = 'resizer_u';
        const savedState = localStorage.getItem(
          `resize:${resizerId}:${pageId}`,
        );
        if (!savedState) {
          node.style.height = '300px';
        }
      }
    },
    [ref, pageId],
  );

  const combinedResizerRef = useCallback(
    (node: HTMLDivElement | null) => {
      resizerElementRef.current = node;
      resizerRef(node);
    },
    [resizerRef],
  );

  const handleMouseEnter = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    hoverTimeoutRef.current = window.setTimeout(() => {
      if (resizerElementRef.current) {
        resizerElementRef.current.classList.add('resizer-hover');
      }
    }, 200);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }

    if (resizerElementRef.current) {
      resizerElementRef.current.classList.remove('resizer-hover');
    }
  }, []);

  // Cleanup таймаута при размонтировании
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const resizerId = 'resizer_u';
  const resizerClassName = 'resizer resizer_u debug-sidebar__resizer--top';

  // Кнопка переключения
  const toggleButton = togglePanel && (
    <Flex
      className={cx('debug-sidebar__toggle')}
      onClick={togglePanel}
      alignItems="center"
      justifyContent="center"
    >
      <ChevronDownWide
        className={cx(
          'debug-sidebar__chevron',
          showPanel
            ? 'debug-sidebar__chevron--opened'
            : 'debug-sidebar__chevron--closed',
        )}
      />
    </Flex>
  );

  const tabs = [
    {
      id: 'data' as const,
      title: 'Data',
      content: dataContent,
    },
    showErrorsTab && {
      id: 'errors' as const,
      title: `Errors (${errorsCount})`,
      content: errorsContent,
    },
    showLogsTab && {
      id: 'logs' as const,
      title: `Logs (${logsCount})`,
      content: logsContent,
    },
    showCubesTab && {
      id: 'cubes' as const,
      title: `Models (${cubesCount})`,
      content: cubesContent,
    },
  ].filter(Boolean) as Array<{
    id: DebugTabId;
    title: string;
    content: React.ReactNode;
  }>;

  // Контент панели — рендерим всегда, но скрываем через CSS когда showPanel=false
  const panelContent = (
    <Flex
      className={cx(
        className,
        'resizable',
        'debug-sidebar',
        !showPanel && 'debug-sidebar--hidden',
      )}
      direction="column"
      ref={combinedPanelRef}
    >
      <Flex
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        className="debug-sidebar__header"
      >
        <TabProvider
          value={internalActiveTab}
          onUpdate={(value) => handleTabChange(value as DebugTabId)}
        >
          <TabList size="m" style={{ width: '100%', padding: '0 18px' }}>
            {tabs.map((tab) => (
              <Tab key={tab.id} value={tab.id}>
                {tab.title}
              </Tab>
            ))}
          </TabList>
        </TabProvider>
      </Flex>
      <Flex
        gap={3}
        direction="column"
        className="debug-sidebar__content"
        style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}
      >
        {/* Все табы рендерятся одновременно, скрываются через display: none */}
        {tabs.map((tab) => (
          <Flex
            key={tab.id}
            direction="column"
            style={{
              display: internalActiveTab === tab.id ? 'flex' : 'none',
              flex: 1,
              minHeight: 0,
              overflow: 'auto',
            }}
          >
            {tab.content}
          </Flex>
        ))}
      </Flex>
      <div
        ref={combinedResizerRef}
        id={resizerId}
        className={resizerClassName}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />
    </Flex>
  );

  return (
    <Flex className="debug-sidebar__wrapper" direction="column">
      {toggleButton}
      {panelContent}
    </Flex>
  );
};
