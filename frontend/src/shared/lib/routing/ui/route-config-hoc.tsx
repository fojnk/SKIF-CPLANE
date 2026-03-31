import { ComponentType } from 'react';

import { RouterConfigContext } from './router-config-context';

export function routeConfigHOC<P>(
  Component: ComponentType<P>,
  cfg: AnyObject = {},
) {
  return function RouteConfigHOC(props: P) {
    return (
      <RouterConfigContext.Provider value={cfg}>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <Component {...(props as any)} />
      </RouterConfigContext.Provider>
    );
  };
}
