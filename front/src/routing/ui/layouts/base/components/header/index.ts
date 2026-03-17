import { loadable } from '@/shared/lib/react/loadable';
import { GlobalLoader } from '@/shared/ui/loaders';

export type { BaseLayoutHeaderProps, BaseLayoutHeaderAction } from './header';
export const Header = loadable(
  async () => (await import('./header')).Header,
  GlobalLoader,
);

export const HeaderActions = loadable(
  async () => (await import('./header-actions')).HeaderActions,
  GlobalLoader,
);

export const HeaderPortal = loadable(
  async () => (await import('./header-portal')).HeaderPortal,
  GlobalLoader,
);
