import { useLayoutEffect } from 'react';

import { useDefineRef } from '@/shared/lib/react/hooks/use-define-ref';

export const useResizeObserver = (callback: ResizeObserverCallback) => {
  const resizeObserverRef = useDefineRef(() => new ResizeObserver(callback));

  useLayoutEffect(() => {
    const observer = resizeObserverRef.current;
    return () => {
      observer.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return resizeObserverRef;
};
