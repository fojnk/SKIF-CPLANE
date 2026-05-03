import { combine } from 'effector';

import { ControlPlaneModule } from '@/modules/control-plane/config';
import { navigationModel } from '@/modules/control-plane/features/navigation';

export const tabsConfig = [
  {
    id: 'projects',
    title: 'Проекты',
    path: ControlPlaneModule.routes.root.path,
    onItemClick: () => navigationModel.projects.navigate(),
    isOpened: ControlPlaneModule.routes.root.$isOpened,
    hidden: true,
    disabled: false,
  },
  {
    id: 'datasets',
    title: 'Наборы данных',
    path: ControlPlaneModule.routes.dataSources.path,
    onItemClick: () => navigationModel.dataSources.navigate(),
    isOpened: ControlPlaneModule.routes.dataSources.$isOpened,
    hidden: true,
    disabled: false,
  },
  {
    id: 'namespaces',
    title: 'Рабочие пространства',
    path: ControlPlaneModule.routes.namespaces.path,
    onItemClick: () => navigationModel.namespaces.navigate(),
    isOpened: ControlPlaneModule.routes.namespaces.$isOpened,
    hidden: true,
    disabled: false,
  },
  {
    id: 'catalog',
    title: 'Каталог',
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
    id: 'access',
    title: 'Доступ',
    path: ControlPlaneModule.routes.access.path,
    onItemClick: () => navigationModel.access.navigate(),
    isOpened: ControlPlaneModule.routes.access.$isOpened,
    disabled: false,
  },
  {
    id: 'updates',
    title: 'Обновления',
    path: ControlPlaneModule.routes.updates.path,
    onItemClick: () => navigationModel.updates.navigate(),
    isOpened: ControlPlaneModule.routes.updates.$isOpened,
    disabled: false,
  },
  {
    id: 'study',
    title: 'Обучение',
    path: ControlPlaneModule.routes.study.path,
    onItemClick: () => navigationModel.study.navigate(),
    isOpened: ControlPlaneModule.routes.study.$isOpened,
    disabled: false,
  },
  {
    id: 'about-platform',
    title: 'О платформе',
    path: ControlPlaneModule.routes.aboutPlatform.path,
    onItemClick: () => navigationModel.aboutPlatform.navigate(),
    isOpened: ControlPlaneModule.routes.aboutPlatform.$isOpened,
    disabled: false,
  },
];
