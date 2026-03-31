import { loadable } from '@/shared/lib/react/loadable';
import { GlobalLoader } from '@/shared/ui/loaders';

export * from './types';

export const Container = loadable(
  async () => (await import('./container')).Container,
  GlobalLoader,
);
