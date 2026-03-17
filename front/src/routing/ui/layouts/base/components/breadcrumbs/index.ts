import { loadable } from '@/shared/lib/react/loadable';

export const Breadcrumb = loadable(
  async () => (await import('./breadcrumb')).Breadcrumb,
);

export const Breadcrumbs = loadable(
  async () => (await import('./breadcrumbs')).Breadcrumbs,
);
