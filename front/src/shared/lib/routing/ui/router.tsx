import { RouterProvider } from 'atomic-router-react';
import { memo, ReactNode } from 'react';

import { Router as RouterType } from '../methods';

export const Router = memo(
  ({ router, children }: { router: RouterType; children?: ReactNode }) => {
    const { RoutesView } = router;

    return (
      <RouterProvider router={router}>
        <RoutesView />
        {children}
      </RouterProvider>
    );
  },
);
