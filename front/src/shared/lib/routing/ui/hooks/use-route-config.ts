import { useContext } from 'react';

import { RouterConfigContext } from '../router-config-context';

export const useRouteConfig = <T extends AnyObject>() => {
  const config = useContext(RouterConfigContext);

  return config as T;
};
