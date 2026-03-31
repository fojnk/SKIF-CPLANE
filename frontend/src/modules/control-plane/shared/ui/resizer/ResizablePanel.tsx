import { ChevronDownWide } from '@gravity-ui/icons';
import { Flex } from '@gravity-ui/uikit';
import cx from 'clsx';
import React, { useCallback, useEffect, useRef } from 'react';

import './resizer.scss';

import { useResizer } from './useResizer';

interface ResizablePanelProps {
  children: React.ReactNode;
  /** CSS класс для контейнера */
  className?: string;
  /** ID для сохранения размера в localStorage */
  pageId: string;
  /** Позиция ресайзера: слева или справа */
  resizerPosition: 'left' | 'right';
  /** Минимальная ширина панели */
  minWidth?: number;
  /** Максимальная ширина панели */
  maxWidth?: number;
  /** Заголовок панели */
  header?: React.ReactNode;
  /** Стили для контейнера контента */
  contentStyle?: React.CSSProperties;
  /** Показать/скрыть панель */
  showPanel?: boolean;
  /** Callback для переключения видимости панели */
  togglePanel?: () => void;
}

/**
 * Панель с возможностью изменения размера
 * Инкапсулирует логику useResizer и hover-эффекты
 */
export const ResizablePanel: React.FC<ResizablePanelProps> = ({
  children,
  className,
  pageId,
  resizerPosition,
  minWidth = 360,
  maxWidth = 840,
  header,
  contentStyle,
  showPanel = true,
  togglePanel,
}) => {
  const [ref, resizerRef] = useResizer({
    size: {
      maxWidth,
      minWidth,
    },
    canCollapse: false,
    pageId,
  });

  const hoverTimeoutRef = useRef<number | null>(null);
  const resizerElementRef = useRef<HTMLDivElement | null>(null);

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

  const isLeft = resizerPosition === 'left';
  const resizerId = isLeft ? 'resizer_l' : 'resizer_r';
  const resizerClassName = isLeft
    ? 'resizer resizer_l resizable-panel__resizer--left'
    : 'resizer resizer_r resizable-panel__resizer--right';

  const positionClass = isLeft
    ? 'resizable-panel-right'
    : 'resizable-panel-left';

  // Определяем позицию переключателя в зависимости от позиции ресайзера
  const togglePositionClass = isLeft
    ? 'resizable-panel__toggle--right'
    : 'resizable-panel__toggle--left';

  const chevronOpenedClass = isLeft
    ? 'resizable-panel__chevron--opened-left'
    : 'resizable-panel__chevron--opened-right';

  const chevronClosedClass = isLeft
    ? 'resizable-panel__chevron--closed-left'
    : 'resizable-panel__chevron--closed-right';

  // Кнопка переключения
  const toggleButton = togglePanel && (
    <Flex
      className={cx('resizable-panel__toggle', togglePositionClass)}
      onClick={togglePanel}
      alignItems="center"
      justifyContent="center"
    >
      <ChevronDownWide
        className={cx(
          'resizable-panel__chevron',
          showPanel ? chevronOpenedClass : chevronClosedClass,
        )}
      />
    </Flex>
  );

  // Контент панели — рендерим всегда, но скрываем через CSS когда showPanel=false
  // Это позволяет сохранить React-дерево и эффекты внутри children
  const panelContent = (
    <Flex
      className={cx(
        className,
        'resizable',
        positionClass,
        !showPanel && 'resizable-panel--hidden',
      )}
      direction="column"
      ref={ref}
    >
      {header && (
        <Flex
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          className="resizable-panel__header"
        >
          {header}
        </Flex>
      )}
      <Flex
        gap={3}
        direction="column"
        className="resizable-panel__content"
        style={contentStyle}
      >
        {children}
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

  // Для панели справа (resizerPosition="left") кнопка слева от панели
  // Для панели слева (resizerPosition="right") кнопка справа от панели
  return (
    <Flex className="resizable-panel__wrapper" direction="row">
      {isLeft && toggleButton}
      {panelContent}
      {!isLeft && toggleButton}
    </Flex>
  );
};
