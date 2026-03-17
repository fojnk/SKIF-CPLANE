import { loadable } from '@/shared/lib/react/loadable';
import { SelectSkeleton } from '@/shared/ui/skeletons';

export const DsTypeSelector = loadable(
  async () => (await import('./ds-type-selector')).DsTypeSelector,
  SelectSkeleton,
);
