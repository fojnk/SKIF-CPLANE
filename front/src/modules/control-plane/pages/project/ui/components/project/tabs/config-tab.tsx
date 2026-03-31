import { useUnit } from 'effector-react';
import React, { useEffect, useMemo } from 'react';

import { projectFormModel } from '@/modules/control-plane/entities/forms/project';
import { projectPageModel } from '@/modules/control-plane/pages/project';
import { controlPlaneApi } from '@/modules/control-plane/shared/api';
import {
  ConfigViewer,
  ConfigFormViewer,
} from '@/modules/control-plane/shared/components';
import { ProjectInfoDC } from '@/modules/control-plane/shared/types';
import { GlobalLoader } from '@/shared/ui/loaders';

interface Props {
  project: ProjectInfoDC;
}

export const ConfigTab = ({ project }: Props) => {
  const editConfig = useUnit(projectPageModel.editProjectConfig);
  const projectForm = useUnit(projectFormModel);
  const canEdit = useMemo(
    () =>
      (project?.rights ?? []).includes(
        controlPlaneApi.dc.AclRightDC.RightEditConfig,
      ) ?? false,
    [project],
  );

  useEffect(() => {
    projectForm.load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (projectForm.$loading) {
    return <GlobalLoader absolute />;
  }

  return (
    <ConfigViewer
      data={project?.config || ''}
      onEditClick={(mode) => {
        editConfig({
          project: {
            id: project.id!,
            name: project.name!,
          },
          mode,
        });
      }}
      showCodeToggle
      canEdit={canEdit}
      configForm={
        projectForm.$data ? (
          <ConfigFormViewer
            config={project?.config || ''}
            formParams={projectForm.$data}
            readonly
            type="project"
          />
        ) : undefined
      }
    />
  );
};
