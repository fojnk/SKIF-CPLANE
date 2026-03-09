import { Dispatch, SetStateAction, useCallback, useState } from 'react';

import {
  getFromStorage,
  setToStorage,
  StorageType,
} from '@/shared/lib/common/storage';

const isInitialStateFn = <S>(
  state: (S | (() => S)) | SetStateAction<S>,
): state is () => S => typeof state === 'function';
const isSetStateCallable = <S>(
  state: SetStateAction<S>,
): state is (prevState: S) => S => typeof state === 'function';

/**
 * Такой же setState, как и в React, только дополнительно хранит состояние в session\local storage
 */
export const useStorageSyncState = <S>(
  initialState: S | (() => S),
  storageCfg: { key: string; type: StorageType },
): [S, Dispatch<SetStateAction<S>>] => {
  const [state, setStateHandler] = useState(() => {
    const storedValue = getFromStorage<S>(storageCfg);
    if (storedValue == null) {
      return isInitialStateFn(initialState) ? initialState() : initialState;
    }

    return storedValue;
  });

  const setState: Dispatch<SetStateAction<S>> = useCallback((state) => {
    if (isSetStateCallable(state)) {
      setStateHandler((prev) => {
        const nextState = state(prev);
        setToStorage({ ...storageCfg, value: nextState });
        return nextState;
      });
    } else {
      setToStorage({ ...storageCfg, value: state });
      setStateHandler(state);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return [state, setState];
};
