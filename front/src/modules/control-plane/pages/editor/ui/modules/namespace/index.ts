import { loadable } from '@/shared/lib/react/loadable';
import { GlobalLoader } from '@/shared/ui/loaders';

export const Namespace = loadable(
  async () => (await import('./namespace')).Namespace,
  GlobalLoader,
);
