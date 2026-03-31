import { Pipeline, Database } from '@gravity-ui/icons';
import { Breadcrumbs, Flex, Skeleton, Text } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';

import { ControlPlaneModule } from '@/modules/control-plane/config';
import { navigationModel } from '@/modules/control-plane/features/navigation';

const SKELETON_STYLES = {
  width: '60px',
  height: '16px',
  margin: '4px 0',
} as const;

const createSelectedItem = (
  item: any,
  projectUrl: string,
  keyPrefix: string,
  editorType: string,
) => {
  const itemType = item.type === 'experiment' ? 'pipe' : 'ds';
  const tab = editorType === 'ds2' ? 'schema' : 'config';
  const selectedItemUrl = `${projectUrl}&selected=${itemType}-${item.id}&${itemType}Tab=${tab}`;

  return (
    <Breadcrumbs.Item key={`${keyPrefix}-selected`} href={selectedItemUrl}>
      <Flex alignItems="center" gap={1}>
        {item.type === 'experiment' ? (
          <Pipeline style={{ maxWidth: 12 }} />
        ) : (
          <Database style={{ maxWidth: 14 }} />
        )}
        <Text ellipsis variant="inherit">
          {item.name}
        </Text>
      </Flex>
    </Breadcrumbs.Item>
  );
};

export const MyBreadcrumbs = () => {
  const [
    isProjects,
    isProject,
    isDatasets,
    isNamespaces,
    isNamespace,
    isEditor,
  ] = useUnit([
    ControlPlaneModule.routes.root.$isOpened,
    ControlPlaneModule.routes.project.$isOpened,
    ControlPlaneModule.routes.dataSources.$isOpened,
    ControlPlaneModule.routes.namespaces.$isOpened,
    ControlPlaneModule.routes.namespace.$isOpened,
    ControlPlaneModule.routes.editor.$isOpened,
  ]);
  const namespace = useUnit(navigationModel.namespace.$bread);
  const project = useUnit(navigationModel.project.$bread);
  const projectItem = useUnit(navigationModel.project.$selected);
  const projectSelectedQuery = useUnit(navigationModel.project.$selectedQuery);
  const editor = useUnit(navigationModel.editor.$bread);
  const editorProjectItem = useUnit(navigationModel.editor.$selected);
  const editorQuery = useUnit(navigationModel.editor.$queryParams);

  const getEditorText = (entity: string): string => {
    switch (entity) {
      case 'project':
        return 'Edit config';
      case 'pipe':
        return 'Edit config';
      case 'ds':
        return 'Edit config';
      case 'ds2':
        return 'Edit schema';
      case 'ns':
        return 'Edit config';
      default:
        return 'Edit config';
    }
  };
  const renderBreadcrumbs = () => {
    const breadcrumbs = [];

    if (
      isProjects ||
      isProject ||
      (isEditor && editorQuery.entity && editorQuery.entity !== 'ns')
    ) {
      breadcrumbs.push(
        <Breadcrumbs.Item key="projects" href={ControlPlaneModule.routes.root.path}>
          Projects
        </Breadcrumbs.Item>,
      );

      if (isProject || isEditor) {
        const projectData = isProject ? project : editor;
        const projectItemData = isProject ? projectItem : editorProjectItem;
        const keyPrefix = isProject ? 'project' : 'editor';

        if (projectData) {
          const projectUrl = `${ControlPlaneModule.routes.project.path}?id=${projectData.id}`;
          const tab = isProject ? 'content' : 'config';
          breadcrumbs.push(
            <Breadcrumbs.Item key={keyPrefix} href={`${projectUrl}&tab=${tab}`}>
              {projectData.name}
            </Breadcrumbs.Item>,
          );

          if (projectItemData) {
            breadcrumbs.push(
              createSelectedItem(
                projectItemData,
                projectUrl,
                keyPrefix,
                editorQuery.entity ?? '',
              ),
            );
          } else if (projectSelectedQuery) {
            breadcrumbs.push(
              <Breadcrumbs.Item key={`${keyPrefix}-selected-skeleton`}>
                <Skeleton style={SKELETON_STYLES} />
              </Breadcrumbs.Item>,
            );
          }
        } else {
          breadcrumbs.push(
            <Breadcrumbs.Item key={`${keyPrefix}-skeleton`}>
              <Skeleton style={SKELETON_STYLES} />
            </Breadcrumbs.Item>,
          );
        }
      }
    }

    if (isDatasets) {
      breadcrumbs.push(
        <Breadcrumbs.Item
          key="datasets"
          href={ControlPlaneModule.routes.dataSources.path}
        >
          Datasets
        </Breadcrumbs.Item>,
      );
    }

    if (
      isNamespaces ||
      isNamespace ||
      (isEditor && editorQuery.entity && editorQuery.entity === 'ns')
    ) {
      breadcrumbs.push(
        <Breadcrumbs.Item
          key="namespaces"
          href={ControlPlaneModule.routes.namespaces.path}
        >
          Workspaces
        </Breadcrumbs.Item>,
      );
      // Обработка editor и namespace (одинаковая логика)
      if (isEditor || isNamespace) {
        const namespaceData = isEditor ? editor : namespace;
        const keyPrefix = isEditor ? 'editor' : 'namespace';

        if (namespaceData) {
          const href = `${ControlPlaneModule.routes.namespace.path}?id=${namespaceData.id}&tab=config`;
          breadcrumbs.push(
            <Breadcrumbs.Item key={keyPrefix} href={href}>
              {namespaceData.name}
            </Breadcrumbs.Item>,
          );
        } else {
          breadcrumbs.push(
            <Breadcrumbs.Item key={`${keyPrefix}-skeleton`}>
              <Skeleton style={SKELETON_STYLES} />
            </Breadcrumbs.Item>,
          );
        }
      }
    }

    if (isEditor && editorQuery.entity) {
      breadcrumbs.push(
        <Breadcrumbs.Item key="editor-type" disabled>
          {getEditorText(editorQuery.entity)}
        </Breadcrumbs.Item>,
      );
    }
    return breadcrumbs;
  };

  return (
    <Breadcrumbs style={{ width: '100%', padding: '0 6px' }}>
      {renderBreadcrumbs()}
    </Breadcrumbs>
  );
};
