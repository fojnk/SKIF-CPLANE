import {
  Databases,
  LayoutSplitRows,
  Briefcase,
  File,
  Bug,
  Cubes3,
  CurlyBrackets,
} from '@gravity-ui/icons';
import { MenuItem } from '@gravity-ui/navigation';
import { useUnit } from 'effector-react';
import { ReactNode, useCallback, useMemo } from 'react';

import { SFModule } from '@/modules/stream-flow/config';
import { ShowCubesMarketModel } from '@/modules/stream-flow/features/cubes/market';
import { navigationModel } from '@/modules/stream-flow/features/navigation';
import { VariableShowListModel } from '@/modules/stream-flow/features/variable/show-list';
import { editorPageModel } from '@/modules/stream-flow/pages/editor';
import { BaseLayout } from '@/routing';

import { MyBreadcrumbs } from './breadcrumbs';

import './page-layout.scss';
import './json-viewer.scss';
import './color-theme.scss';
import './form-fields.scss';
import './logs.scss';
import './fixes.scss';

export const PageLayout = ({ children }: { children?: ReactNode }) => {
  const isEditorOpened = useUnit(SFModule.routes.editor.$isOpened);
  const editorQuery = useUnit(navigationModel.editor.$queryParams);
  const isProjectsOpened = useUnit(SFModule.routes.root.$isOpened);
  const isDatasetsOpened = useUnit(SFModule.routes.dataSources.$isOpened);
  const isNamespacesOpened = useUnit(SFModule.routes.namespaces.$isOpened);

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
        link: `${SFModule.routes.root.path}`,
        icon: Briefcase,
        current: isProjectsOpened,
        onItemClick: () => navigationModel.projects.navigate(),
      },
      {
        id: 'datasets',
        title: 'Датасеты',
        link: `${SFModule.routes.dataSources.path}`,
        icon: Databases,
        current: isDatasetsOpened,
        onItemClick: () => navigationModel.dataSources.navigate(),
      },
      {
        id: 'namespaces',
        title: 'Рабочие пространства',
        link: `${SFModule.routes.namespaces.path}`,
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
      extraFooterItems={[
        {
          id: 'documentation-badge',
          title: 'Документация',
          icon: File,
          onItemClick: () =>
            window.open(
              'https://docs.vk.team/control-plane/index.html',
              '_blank',
            ),
        },
        {
          id: 'contact_us',
          title: 'Сообщите нам о баге',
          icon: Bug,
          onItemClick: () =>
            window.open(
              'https://jira.vk.team/secure/CreateIssue.jspa?issuetype=1&pid=72973',
              '_blank',
            ),
        },
      ]}
    >
      <BaseLayout.Header topAligned>
        <MyBreadcrumbs />
      </BaseLayout.Header>
      {children}
    </BaseLayout.Container>
  );
};
