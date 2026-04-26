import {
  Databases,
  LayoutSplitRows,
  Briefcase,
  Cubes3,
  CurlyBrackets,
} from '@gravity-ui/icons';
import { MenuItem } from '@gravity-ui/navigation';
import { useUnit } from 'effector-react';
import { ReactNode, useCallback, useMemo } from 'react';

import { ControlPlaneModule } from '@/modules/control-plane/config';
import { ShowCubesMarketModel } from '@/modules/control-plane/features/cubes/market';
import { navigationModel } from '@/modules/control-plane/features/navigation';
import { VariableShowListModel } from '@/modules/control-plane/features/variable/show-list';
import { editorPageModel } from '@/modules/control-plane/pages/editor';
import { BaseLayout } from '@/routing';

import { MyBreadcrumbs } from './breadcrumbs';

import './page-layout.scss';
import './json-viewer.scss';
import './color-theme.scss';
import './form-fields.scss';
import './logs.scss';
import './fixes.scss';

export const PageLayout = ({ children }: { children?: ReactNode }) => {
  const isEditorOpened = useUnit(ControlPlaneModule.routes.editor.$isOpened);
  const editorQuery = useUnit(navigationModel.editor.$queryParams);
  const isProjectsOpened = useUnit(ControlPlaneModule.routes.root.$isOpened);
  const isDatasetsOpened = useUnit(ControlPlaneModule.routes.dataSources.$isOpened);
  const isNamespacesOpened = useUnit(ControlPlaneModule.routes.namespaces.$isOpened);

  // Данные для experiment editor
  const experimentData = useUnit(editorPageModel.editor.$data);
  const variablesData = useUnit(editorPageModel.variables.$data);

  const showAddButton =
    isEditorOpened &&
    editorQuery.entity === 'pipe' &&
    editorQuery.mode === 'form';

  const isExperimentEditor =
    isEditorOpened && editorQuery.entity === 'pipe' && editorQuery.id;

  const handleVariablesClick = useCallback(() => {
    if (editorQuery.id && experimentData) {
      VariableShowListModel.start({
        experiment_id: parseInt(editorQuery.id, 10),
        experiment_name: experimentData.name,
        variables: variablesData ?? undefined,
      });
    }
  }, [editorQuery.id, experimentData, variablesData]);

  const menuItems = useMemo(() => {
    const items: MenuItem[] = [
      {
        id: 'divider-1',
        title: '',
        type: 'divider',
      },
      {
        id: 'projects',
        title: 'Проекты',
        link: `${ControlPlaneModule.routes.root.path}`,
        icon: Briefcase,
        current: isProjectsOpened,
        onItemClick: () => navigationModel.projects.navigate(),
      },
      {
        id: 'datasets',
        title: 'Датасеты',
        link: `${ControlPlaneModule.routes.dataSources.path}`,
        icon: Databases,
        current: isDatasetsOpened,
        onItemClick: () => navigationModel.dataSources.navigate(),
      },
      {
        id: 'namespaces',
        title: 'Рабочие пространства',
        link: `${ControlPlaneModule.routes.namespaces.path}`,
        icon: LayoutSplitRows,
        current: isNamespacesOpened,
        onItemClick: () => navigationModel.namespaces.navigate(),
      },
      {
        id: 'divider-2',
        title: '',
        type: 'divider',
      },
      {
        id: 'cubes-market',
        title: 'Маркет моделей',
        icon: Cubes3,
        onItemClick: () =>
          ShowCubesMarketModel.start({
            canAdd: showAddButton,
          }),
      },
    ];

    // Добавляем кнопку Variables только если редактируется experiment
    if (isExperimentEditor) {
      items.push({
        id: 'variables',
        title: 'Переменные',
        icon: CurlyBrackets,
        onItemClick: handleVariablesClick,
      });
    }

    return items as MenuItem[];
  }, [
    isExperimentEditor,
    showAddButton,
    isProjectsOpened,
    isDatasetsOpened,
    isNamespacesOpened,
    handleVariablesClick,
  ]);

  return (
    <BaseLayout.Container
      className="sf-layout"
      menuItems={menuItems}
      omitAsideLogo
    >
      <BaseLayout.Header topAligned>
        <MyBreadcrumbs />
      </BaseLayout.Header>
      {children}
    </BaseLayout.Container>
  );
};
