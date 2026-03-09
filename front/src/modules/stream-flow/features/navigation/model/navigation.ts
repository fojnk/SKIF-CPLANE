import { combine } from 'effector';

import { SFModule } from '@/modules/stream-flow/config';
import { navigationModel } from '@/modules/stream-flow/features/navigation';

export const tabsConfig = [
  {
    id: 'projects',
    title: 'Projects',
    path: SFModule.routes.root.path,
    onItemClick: () => navigationModel.projects.navigate(),
    isOpened: SFModule.routes.root.$isOpened,
    hidden: true,
    disabled: false,
  },
  {
    id: 'datasets',
    title: 'Datasets',
    path: SFModule.routes.dataSources.path,
    onItemClick: () => navigationModel.dataSources.navigate(),
    isOpened: SFModule.routes.dataSources.$isOpened,
    hidden: true,
    disabled: false,
  },
  {
    id: 'namespaces',
    title: 'Workspaces',
    path: SFModule.routes.namespaces.path,
    onItemClick: () => navigationModel.namespaces.navigate(),
    isOpened: SFModule.routes.namespaces.$isOpened,
    hidden: true,
    disabled: false,
  },
  {
    id: 'catalog',
    title: 'Catalog',
    path: SFModule.routes.catalog.path,
    onItemClick: () => navigationModel.projects.navigate(),
    isOpened: combine(
      SFModule.routes.dataSources.$isOpened,
      SFModule.routes.namespaces.$isOpened,
      SFModule.routes.root.$isOpened,
      (ds, ns, root) => ds || ns || root,
    ),
    disabled: false,
  },
  {
    id: 'activity',
    title: 'Activity',
    path: SFModule.routes.activity.path,
    onItemClick: () => navigationModel.activity.navigate(),
    disabled: true,
  },
  {
    id: 'world-map',
    title: 'World map',
    path: SFModule.routes.worldMap.path,
    onItemClick: () => navigationModel.worldMap.navigate(),
    disabled: true,
  },
  {
    id: 'monitoring',
    title: 'Monitoring',
    path: SFModule.routes.monitoring.path,
    onItemClick: () => navigationModel.monitoring.navigate(),
    disabled: true,
  },
  {
    id: 'updates',
    title: 'Updates',
    path: SFModule.routes.updates.path,
    onItemClick: () => navigationModel.updates.navigate(),
    disabled: true,
  },
  {
    id: 'study',
    title: 'Study',
    path: SFModule.routes.study.path,
    onItemClick: () => navigationModel.study.navigate(),
    disabled: true,
  },
  {
    id: 'access',
    title: 'Access',
    path: SFModule.routes.access.path,
    onItemClick: () => navigationModel.access.navigate(),
    disabled: true,
  },
  {
    id: 'about-platform',
    title: 'About platform',
    path: SFModule.routes.aboutPlatform.path,
    onItemClick: () => navigationModel.aboutPlatform.navigate(),
    disabled: true,
  },
];
