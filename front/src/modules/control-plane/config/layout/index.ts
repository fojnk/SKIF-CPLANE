import { loadable } from '@/shared/lib/react/loadable';
import { GlobalLoader } from '@/shared/ui/loaders';

export const PageLayout = loadable(
  async () => (await import('./page-layout')).PageLayout,
  GlobalLoader,
);
