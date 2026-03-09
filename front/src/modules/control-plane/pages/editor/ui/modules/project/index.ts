import { loadable } from '@/shared/lib/react/loadable';
import { GlobalLoader } from '@/shared/ui/loaders';

export const Project = loadable(
  async () => (await import('./project')).Project,
  GlobalLoader,
);
