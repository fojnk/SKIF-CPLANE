import { loadable } from '@/shared/lib/react/loadable';
import { GlobalLoader } from '@/shared/ui/loaders';

export const Experiment = loadable(
  async () => (await import('./experiment')).Experiment,
  GlobalLoader,
);
