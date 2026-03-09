import { loadable } from '@/shared/lib/react/loadable';
import { GlobalLoader } from '@/shared/ui/loaders';

export const DatasetConfig = loadable(
  async () => (await import('./dataset-config')).DatasetConfig,
  GlobalLoader,
);
