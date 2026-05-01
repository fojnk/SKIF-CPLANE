import { BaseTemplateConfig } from '@/routing/types';
import { createRoute } from '@/shared/lib/routing';

import { PageLayout } from './layout';

//const isTesting = import.meta.env.VITE_TESTING === 'true';

export const root = createRoute({
  type: 'page',
  path: '/',
  private: true,
  view: async () => (await import('../pages/projects')).SFProjectsPage,
  layout: PageLayout,
  config: { aside: true } satisfies BaseTemplateConfig,
});

export const login = createRoute({
  type: 'page',
  path: '/login',
  view: async () => (await import('../pages/login')).LoginPage,
});

export const register = createRoute({
  type: 'page',
  path: '/register',
  view: async () => (await import('../pages/register')).RegisterPage,
});

export const dataSources = createRoute({
  type: 'page',
  path: '/datasets',
  private: true,
  view: async () => (await import('../pages/datasets')).SFDatasetsPage,
  layout: PageLayout,
  config: { aside: true } satisfies BaseTemplateConfig,
});

export const namespaces = createRoute({
  type: 'page',
  path: '/namespaces',
  private: true,
  view: async () => (await import('../pages/namespaces')).SFNamespacesPage,
  layout: PageLayout,
  config: { aside: true } satisfies BaseTemplateConfig,
});

export const namespace = createRoute({
  type: 'page',
  path: '/namespace',
  private: true,
  view: async () => (await import('../pages/namespace')).SFNamespacePage,
  layout: PageLayout,
  config: { aside: true } satisfies BaseTemplateConfig,
});

export const project = createRoute({
  type: 'page',
  path: '/project',
  private: true,
  view: async () => (await import('../pages/project')).SFProjectPage,
  layout: PageLayout,
  config: { aside: true } satisfies BaseTemplateConfig,
});

export const editor = createRoute({
  type: 'page',
  path: '/editor',
  private: true,
  view: async () => (await import('../pages/editor')).SFEditorPage,
  layout: PageLayout,
  config: { aside: true } satisfies BaseTemplateConfig,
});

export const catalog = createRoute({
  type: 'page',
  path: '/catalog',
  private: true,
  view: async () => (await import('../pages/empty')).emptyPage,
  layout: PageLayout,
  config: { aside: true } satisfies BaseTemplateConfig,
});

export const worldMap = createRoute({
  type: 'page',
  path: '/worldmap',
  private: true,
  view: async () => (await import('../pages/empty')).emptyPage,
  layout: PageLayout,
  config: { aside: true } satisfies BaseTemplateConfig,
});

export const updates = createRoute({
  type: 'page',
  path: '/updates',
  private: true,
  view: async () => (await import('../pages/updates')).SFUpdatesPage,
  layout: PageLayout,
  config: { aside: true } satisfies BaseTemplateConfig,
});

export const study = createRoute({
  type: 'page',
  path: '/study',
  private: true,
  view: async () => (await import('../pages/study')).SFStudyPage,
  layout: PageLayout,
  config: { aside: true } satisfies BaseTemplateConfig,
});

export const access = createRoute({
  type: 'page',
  path: '/access',
  private: true,
  view: async () => (await import('../pages/access')).SFAccessPage,
  layout: PageLayout,
  config: { aside: true } satisfies BaseTemplateConfig,
});

export const aboutPlatform = createRoute({
  type: 'page',
  path: '/about-platform',
  private: true,
  view: async () => (await import('../pages/about-platform')).SFAboutPlatformPage,
  layout: PageLayout,
  config: { aside: true } satisfies BaseTemplateConfig,
});
