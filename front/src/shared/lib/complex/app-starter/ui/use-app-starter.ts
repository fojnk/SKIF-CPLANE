import { useLayoutEffect } from 'react';

import { appStartModel } from '@/shared/lib/complex/app-starter';

export const useAppStarter = () => {
  useLayoutEffect(() => {
    appStartModel.appStartCalled.turnOn();
  }, []);
};
