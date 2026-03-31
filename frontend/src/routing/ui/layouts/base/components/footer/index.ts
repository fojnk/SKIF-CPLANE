import { loadable } from '@/shared/lib/react/loadable';
import { GlobalLoader } from '@/shared/ui/loaders';

export type { BaseLayoutFooterProps } from './footer';
export const Footer = loadable(
  async () => (await import('./footer')).Footer,
  GlobalLoader,
);

export const FooterActions = loadable(
  async () => (await import('./footer-actions')).FooterActions,
  GlobalLoader,
);

export const FooterPortal = loadable(
  async () => (await import('./footer-portal')).FooterPortal,
  GlobalLoader,
);
