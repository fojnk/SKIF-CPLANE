import { useLayoutEffect, useRef } from 'react';

export const useElementRef = <T extends HTMLElement>(selector: () => T) => {
  const ref = useRef<T>();

  useLayoutEffect(() => {
    ref.current = selector();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return ref;
};
