import { loadable } from '@/shared/lib/react/loadable';
import { GlobalLoader } from '@/shared/ui/loaders';

export type { BaseLayoutSectionProps } from './section';
export const Section = loadable(
  async () => (await import('./section')).Section,
  GlobalLoader,
);
