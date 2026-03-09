import { ChevronDownWide } from '@gravity-ui/icons';
import { Flex } from '@gravity-ui/uikit';
import cx from 'clsx';
import React, { ReactNode, useCallback, useRef, useEffect } from 'react';

import { SFLayoutHeader } from '@/modules/stream-flow/shared/layout/sf-layout-header';
import { useResizer } from '@/modules/stream-flow/shared/ui/resizer/useResizer';

import css from './sf.module.scss';

interface Props {
  title?: string;
  children?: ReactNode;
  aside?: ReactNode;
  showAside?: boolean;
  toggleAside?: () => void;
  resizable?: {
    maxWidth?: number;
    minWidth?: number;
    canCollapse?: boolean;
    pageId: string;
  };
}

export const SFLayoutMain = ({
  children,
  title,
  aside,
  resizable,
  showAside = true,
  toggleAside,
}: Props) => {
  const [ref] = useResizer({
    size: {
      maxWidth: resizable?.maxWidth ?? 720,
      minWidth: resizable?.minWidth ?? 240,
    },
    canCollapse: resizable?.canCollapse,
    pageId: resizable?.pageId,
  });

  const hoverTimeoutRef = useRef<number | null>(null);

  const handleMouseEnter = useCallback(() => {
    // Очищаем предыдущий таймаут если он есть
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    // Устанавливаем новый таймаут на 400ms
    hoverTimeoutRef.current = setTimeout(() => {
      const resizerElement = document.getElementById('resizer_r');
      if (resizerElement) {
        resizerElement.classList.add('resizer-hover');
      }
    }, 200);
  }, []);

  const handleMouseLeave = useCallback(() => {
    // Очищаем таймаут
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }

    // Удаляем класс немедленно
    const resizerElement = document.getElementById('resizer_r');
    if (resizerElement) {
      resizerElement.classList.remove('resizer-hover');
    }
  }, []);

  // Очищаем таймаут при размонтировании компонента
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  return (
    <Flex direction="row" className={css.layoutMain}>
      {aside && showAside && (
        <Flex
          direction="column"
          className={cx(css.layoutMainAside, resizable && 'resizable')}
          ref={resizable ? ref : null}
        >
          {resizable && (
            <div
              id="resizer_r"
              className="resizer resizer_r"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            ></div>
          )}
          {aside}
        </Flex>
      )}
      <Flex direction="column" className={css.layoutMainBody}>
        {aside && (
          <Flex
            className={css.asideClosureNew}
            onClick={toggleAside}
            alignItems="center"
            justifyContent="center"
          >
            <ChevronDownWide
              className={cx(
                css.asideClosureChevron,
                showAside ? css.asideOpened : css.asideClosed,
              )}
            />
          </Flex>
        )}
        {title && <SFLayoutHeader title={title} />}
        <Flex direction="column" className={css.layoutMainContent}>
          <Flex direction="column" style={{ height: '100%' }}>
            {children}
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
};
