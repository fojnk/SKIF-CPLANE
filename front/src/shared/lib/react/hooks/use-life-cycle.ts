import { useEffect } from 'react';

import { useSyncRef } from '@/shared/lib/react/hooks/use-sync-ref';

export const useLifeCycle = (
  fn: () => {
    mount?: VoidFunction;
    unmount?: VoidFunction;
  },
) => {
  const fnRef = useSyncRef(fn);

  useEffect(() => {
    const fnOperation = fnRef.current();
    fnOperation.mount?.();
    return fnOperation.unmount?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
