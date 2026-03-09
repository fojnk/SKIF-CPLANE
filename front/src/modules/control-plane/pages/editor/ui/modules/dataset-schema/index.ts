import { loadable } from '@/shared/lib/react/loadable';
import { GlobalLoader } from '@/shared/ui/loaders';

export const DatasetSchema = loadable(
  async () => (await import('./dataset-schema')).DatasetSchema,
  GlobalLoader,
);
