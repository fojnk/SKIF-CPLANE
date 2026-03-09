import { throttle } from 'lodash-es';
import { useCallback, useEffect, useRef, useState } from 'react';

enum Direction {
  Horizontal = 'Horizontal',
  Vertical = 'Vertical',
}

enum ResizerType {
  'resizer_l' = 'resizer_l',
  'resizer_r' = 'resizer_r',
  'resizer_u' = 'resizer_u',
}

interface SizeState {
  minWidth?: Maybe<number>;
  maxWidth?: Maybe<number>;
  minHeight?: Maybe<number>;
  maxHeight?: Maybe<number>;
}

const MINIMAL_WIDTH = 5;

const updateCursor = (direction: Direction) => {
  document.body.style.cursor =
    direction === Direction.Horizontal ? 'col-resize' : 'row-resize';
  document.body.style.userSelect = 'none';
};

const resetCursor = () => {
  document.body.style.removeProperty('cursor');
  document.body.style.removeProperty('user-select');
};

const makeResizeLocalStorageKey = ({
  nodeId,
  pageId,
}: {
  nodeId: string;
  pageId: string;
}) => {
  return `resize:${nodeId}:${pageId}`;
};

const saveResizeStateToLocalStorage = ({
  width,
  height,
  nodeId = '',
  pageId = '',
}: {
  width: string;
  height: string;
  nodeId?: string;
  pageId?: string;
}) => {
  window.localStorage.setItem(
    makeResizeLocalStorageKey({ pageId, nodeId }),
    `${width};${height}`,
  );
};

const getResizeStateFromLocalStorage = ({
  nodeId = '',
  pageId = '',
}: {
  nodeId?: string;
  pageId?: string;
}) => {
  const state = window.localStorage.getItem(
    makeResizeLocalStorageKey({ nodeId, pageId }),
  );
  if (state) {
    return {
      width: state.split(';')[0],
      height: state.split(';')[1],
    };
  }
  return null;
};

const getDirection = (resizer: string) => {
  return resizer === ResizerType.resizer_l || resizer === ResizerType.resizer_r
    ? Direction.Horizontal
    : Direction.Vertical;
};

export const useResizer = ({
  size = {},
  canCollapse = false,
  pageId,
}: {
  size?: SizeState;
  canCollapse?: boolean;
  pageId?: string;
}) => {
  const [sizeState] = useState<Maybe<SizeState>>(size);
  const [node, setNode] = useState<HTMLElement | null>(null);
  const [resizerNode, setResizerNode] = useState<HTMLElement | null>(null);
  const throttledHandlerRef = useRef<ReturnType<typeof throttle> | null>(null);

  const ref = useCallback((nodeEle: HTMLElement | null) => {
    setNode(nodeEle);
  }, []);

  const resizerRef = useCallback((nodeEle: HTMLElement | null) => {
    setResizerNode(nodeEle);
  }, []);

  const handleMouseDown = useCallback(
    (e: any) => {
      if (!node || !e.target) {
        return;
      }

      const resizer = (e.target as Element).id;
      const direction = getDirection(resizer);
      const startPos = {
        x: e.clientX,
        y: e.clientY,
      };
      const styles = window.getComputedStyle(node);
      const w = parseInt(styles.width, 10);
      const h = parseInt(styles.height, 10);

      const handleMouseMove = (e: MouseEvent) => {
        const dx = e.clientX - startPos.x;
        const dy = e.clientY - startPos.y;

        let newWidth = w;
        if (resizer === ResizerType.resizer_l) {
          newWidth = w - dx;
        } else {
          newWidth = w + dx;
        }
        let newHeight = h - dy;

        if (sizeState?.maxWidth || sizeState?.minWidth) {
          newWidth =
            sizeState.maxWidth && newWidth >= sizeState.maxWidth
              ? sizeState.maxWidth
              : newWidth;
          newWidth =
            sizeState.minWidth && newWidth < sizeState.minWidth
              ? canCollapse
                ? MINIMAL_WIDTH
                : sizeState.minWidth
              : newWidth;
        }

        if (sizeState?.maxHeight || sizeState?.minHeight) {
          newHeight =
            sizeState.maxHeight && newHeight >= sizeState.maxHeight
              ? sizeState.maxHeight
              : newHeight;
          newHeight =
            sizeState?.minHeight && newHeight <= sizeState?.minHeight
              ? sizeState.minHeight
              : newHeight;
        }

        if (direction === Direction.Horizontal) {
          node.style['width'] = `${newWidth}px`;
        } else {
          node.style['height'] = `${newHeight}px`;
        }

        updateCursor(direction);
        saveResizeStateToLocalStorage({
          width: `${newWidth}px`,
          height: `${newHeight}px`,
          nodeId: resizer,
          pageId,
        });
      };

      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.onselectstart = null;

        resetCursor();
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.onselectstart = function () {
        return false;
      };
    },
    [
      node,
      sizeState?.maxHeight,
      sizeState?.maxWidth,
      sizeState?.minHeight,
      sizeState?.minWidth,
      pageId,
      canCollapse,
    ],
  );

  // Эффект для resizer элементов внутри node (прямые потомки)
  useEffect(() => {
    if (!node) {
      return;
    }

    const resizerElements = Array.from(
      node.querySelectorAll(':scope > [id*=resizer]'),
    );

    resizerElements.forEach((resizerElement) => {
      const state = getResizeStateFromLocalStorage({
        pageId,
        nodeId: resizerElement.id,
      });

      const direction = getDirection(resizerElement.id);
      if (state) {
        if (direction === Direction.Vertical) {
          node.style['height'] = state.height;
        } else {
          node.style['width'] = state.width;
        }
      }
      resizerElement.addEventListener('mousedown', throttle(handleMouseDown));
    });

    return () => {
      resizerElements.forEach((resizerElement) => {
        resizerElement.removeEventListener('mousedown', handleMouseDown);
      });
    };
  }, [node, pageId, handleMouseDown]);

  // Эффект для внешнего resizer элемента (через resizerRef)
  useEffect(() => {
    if (!node || !resizerNode) {
      return;
    }

    const state = getResizeStateFromLocalStorage({
      pageId,
      nodeId: resizerNode.id,
    });

    const direction = getDirection(resizerNode.id);
    if (state) {
      if (direction === Direction.Vertical) {
        node.style['height'] = state.height;
      } else {
        node.style['width'] = state.width;
      }
    }

    throttledHandlerRef.current = throttle(handleMouseDown);
    resizerNode.addEventListener('mousedown', throttledHandlerRef.current);

    return () => {
      if (throttledHandlerRef.current) {
        resizerNode.removeEventListener(
          'mousedown',
          throttledHandlerRef.current,
        );
      }
    };
  }, [node, resizerNode, pageId, handleMouseDown]);

  return [ref, resizerRef] as const;
};
