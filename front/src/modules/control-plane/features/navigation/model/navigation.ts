import { combine } from 'effector';

import { ControlPlaneModule } from '@/modules/control-plane/config';
import { navigationModel } from '@/modules/control-plane/features/navigation';

export const tabsConfig = [
  {
    id: 'projects',
    title: 'Projects',
    path: ControlPlaneModule.routes.root.path,
    onItemClick: () => navigationModel.projects.navigate(),
    isOpened: ControlPlaneModule.routes.root.$isOpened,
    hidden: true,
    disabled: false,
  },
  {
    id: 'datasets',
    title: 'Datasets',
    path: ControlPlaneModule.routes.dataSources.path,
    onItemClick: () => navigationModel.dataSources.navigate(),
    isOpened: ControlPlaneModule.routes.dataSources.$isOpened,
    hidden: true,
    disabled: false,
  },
  {
    id: 'namespaces',
    title: 'Workspaces',
    path: ControlPlaneModule.routes.namespaces.path,
    onItemClick: () => navigationModel.namespaces.navigate(),
    isOpened: ControlPlaneModule.routes.namespaces.$isOpened,
    hidden: true,
    disabled: false,
  },
  {
    id: 'catalog',
    title: 'Catalog',
    path: ControlPlaneModule.routes.catalog.path,
    onItemClick: () => navigationModel.projects.navigate(),
    isOpened: combine(
      ControlPlaneModule.routes.dataSources.$isOpened,
      ControlPlaneModule.routes.namespaces.$isOpened,
      ControlPlaneModule.routes.root.$isOpened,
      (ds, ns, root) => ds || ns || root,
    ),
    disabled: false,
  },
  {
    id: 'activity',
    title: 'Activity',
    path: ControlPlaneModule.routes.activity.path,
    onItemClick: () => navigationModel.activity.navigate(),
    disabled: true,
  },
  {
    id: 'world-map',
    title: 'World map',
    path: ControlPlaneModule.routes.worldMap.path,
    onItemClick: () => navigationModel.worldMap.navigate(),
    disabled: true,
  },
  {
    id: 'monitoring',
    title: 'Monitoring',
    path: ControlPlaneModule.routes.monitoring.path,
    onItemClick: () => navigationModel.monitoring.navigate(),
    disabled: true,
  },
  {
    id: 'updates',
    title: 'Updates',
    path: ControlPlaneModule.routes.updates.path,
    onItemClick: () => navigationModel.updates.navigate(),
    disabled: true,
  },
  {
    id: 'study',
    title: 'Study',
    path: ControlPlaneModule.routes.study.path,
    onItemClick: () => navigationModel.study.navigate(),
    disabled: true,
  },
  {
    id: 'access',
    title: 'Access',
    path: ControlPlaneModule.routes.access.path,
    onItemClick: () => navigationModel.access.navigate(),
    disabled: true,
  },
  {
    id: 'about-platform',
    title: 'About platform',
    path: ControlPlaneModule.routes.aboutPlatform.path,
    onItemClick: () => navigationModel.aboutPlatform.navigate(),
    disabled: true,
  },
];
